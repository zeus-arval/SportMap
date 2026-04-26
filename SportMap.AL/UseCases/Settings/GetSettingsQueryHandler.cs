using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Settings
{
    public record GetSettingsQuery(Guid UserId) : IQuery<UserSettingsDto>;

    public class GetSettingsQueryHandler(
        IUnitOfWork unitOfWork,
        ILogger<GetSettingsQueryHandler> logger
    ) : IQueryHandler<GetSettingsQuery, UserSettingsDto>
    {
        public async Task<Result<UserSettingsDto>> Handle(GetSettingsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var user = await unitOfWork.UserRepository.GetByIdAsync(query.UserId, cancellationToken);

                if (user is null)
                    return Result<UserSettingsDto>.WithError(string.Format(ResultConstants.NotFound, query.UserId));

                var personalization = await unitOfWork.PersonalizationRepository
                    .GetByUserIdAsync(query.UserId, cancellationToken);

                if (personalization is null)
                {
                    return Result<UserSettingsDto>.WithData(new UserSettingsDto
                    {
                        Id = Guid.Empty,
                        BirthdatePrivacy = "private",
                    });
                }

                return Result<UserSettingsDto>.WithData(new UserSettingsDto
                {
                    Id = personalization.Id,
                    BirthdatePrivacy = personalization.BirthdatePrivacyType?.Name?.ToLower() ?? "private",
                });
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled",
                    nameof(GetSettingsQueryHandler), nameof(Handle));
                return Result<UserSettingsDto>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception",
                    nameof(GetSettingsQueryHandler), nameof(Handle));
                return Result<UserSettingsDto>.WithError(ResultConstants.InternalError);
            }
        }
    }
}
