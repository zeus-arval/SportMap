using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Profile
{
    public record UpdateProfileCommand(
        Guid UserId,
        string? FirstName,
        string? LastName,
        string? UserName,
        DateOnly? Birthdate
    ) : ICommand<UserProfileDto>;

    public class UpdateProfileCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<UpdateProfileCommandHandler> logger
    ) : ICommandHandler<UpdateProfileCommand, UserProfileDto>
    {
        public async Task<Result<UserProfileDto>> Handle(UpdateProfileCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var user = await unitOfWork.UserRepository.GetByIdWithProfileAsync(command.UserId, cancellationToken);

                if (user is null)
                    return Result<UserProfileDto>.WithError(string.Format(ResultConstants.NotFound, command.UserId));

                if (command.UserName is not null && command.UserName != user.UserName)
                {
                    var existing = await unitOfWork.UserRepository.GetByUserNameAsync(command.UserName, cancellationToken);
                    if (existing is not null && existing.Id != command.UserId)
                        return Result<UserProfileDto>.WithError(
                            string.Format(ResultConstants.UsernameTaken, command.UserName));
                }

                if (command.FirstName is not null) user.FirstName = command.FirstName;
                if (command.LastName  is not null) user.LastName  = command.LastName;
                if (command.UserName  is not null) user.UserName  = command.UserName;
                if (command.Birthdate.HasValue)    user.Birthdate = command.Birthdate;

                await unitOfWork.UserRepository.Update(user, cancellationToken);

                return Result<UserProfileDto>.WithData(user.MapToProfileDto());
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled",
                    nameof(UpdateProfileCommandHandler), nameof(Handle));
                return Result<UserProfileDto>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception",
                    nameof(UpdateProfileCommandHandler), nameof(Handle));
                return Result<UserProfileDto>.WithError(ResultConstants.InternalError);
            }
        }
    }
}
