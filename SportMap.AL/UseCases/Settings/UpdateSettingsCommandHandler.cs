using DomainLayer.Entities;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Settings
{
    public record UpdateSettingsCommand(
        Guid UserId,
        string BirthdatePrivacy
    ) : ICommand<UserSettingsDto>;

    public class UpdateSettingsCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<UpdateSettingsCommandHandler> logger
    ) : ICommandHandler<UpdateSettingsCommand, UserSettingsDto>
    {
        private static readonly HashSet<string> ValidPrivacyValues =
            new(StringComparer.OrdinalIgnoreCase) { "public", "private" };

        public async Task<Result<UserSettingsDto>> Handle(UpdateSettingsCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (!ValidPrivacyValues.Contains(command.BirthdatePrivacy))
                    return Result<UserSettingsDto>.WithError(
                        string.Format(ResultConstants.InvalidPrivacyValue, command.BirthdatePrivacy));

                var user = await unitOfWork.UserRepository.GetByIdAsync(command.UserId, cancellationToken);

                if (user is null)
                    return Result<UserSettingsDto>.WithError(string.Format(ResultConstants.NotFound, command.UserId));

                var privacyType = await unitOfWork.PrivacyTypeRepository
                    .GetByNameAsync(command.BirthdatePrivacy, cancellationToken);

                if (privacyType is null)
                {
                    logger.LogError("{class}.{method}: PrivacyType '{value}' not found in database — seed data missing?",
                        nameof(UpdateSettingsCommandHandler), nameof(Handle), command.BirthdatePrivacy);
                    return Result<UserSettingsDto>.WithError(ResultConstants.InternalError);
                }

                var personalization = await unitOfWork.PersonalizationRepository
                    .GetByUserIdAsync(command.UserId, cancellationToken);

                if (personalization is null)
                {
                    personalization = new Personalization
                    {
                        Id                 = Guid.NewGuid(),
                        UserId             = command.UserId,
                        BirthdatePrivacyId = privacyType.Id,
                        CreatedAt          = DateTime.UtcNow,
                    };
                    await unitOfWork.PersonalizationRepository.AddAsync(personalization, cancellationToken);

                    user.PersonalizationId = personalization.Id;
                    await unitOfWork.UserRepository.Update(user, cancellationToken);
                }
                else
                {
                    personalization.BirthdatePrivacyId = privacyType.Id;
                    await unitOfWork.PersonalizationRepository.Update(personalization, cancellationToken);
                }

                return Result<UserSettingsDto>.WithData(new UserSettingsDto
                {
                    Id = personalization.Id,
                    BirthdatePrivacy = privacyType.Name.ToLower(),
                });
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled",
                    nameof(UpdateSettingsCommandHandler), nameof(Handle));
                return Result<UserSettingsDto>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception",
                    nameof(UpdateSettingsCommandHandler), nameof(Handle));
                return Result<UserSettingsDto>.WithError(ResultConstants.InternalError);
            }
        }
    }
}
