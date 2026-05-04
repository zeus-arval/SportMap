using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.AL.UseCases.Profile;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Images
{
    public record RemoveProfilePictureCommand(Guid UserId) : ICommand<UploadImageResponseDto>;

    public class RemoveProfilePictureCommandHandler(
        IUnitOfWork unitOfWork,
        ICacheService cache,
        ILogger<RemoveProfilePictureCommandHandler> logger
    ) : ICommandHandler<RemoveProfilePictureCommand, UploadImageResponseDto>
    {
        public async Task<Result<UploadImageResponseDto>> Handle(
            RemoveProfilePictureCommand command,
            CancellationToken cancellationToken)
        {
            logger.LogInformation("{class}.{method}: Removing profile picture for user {userId}",
                nameof(RemoveProfilePictureCommandHandler), nameof(Handle), command.UserId);

            try
            {
                var user = await unitOfWork.UserRepository.GetUserById(command.UserId, command.ToParameters(), cancellationToken);
                if (user is null)
                    return Result<UploadImageResponseDto>.WithError(
                        string.Format(ResultConstants.NotFound, command.UserId));
                if (user.ProfilePictureId is null)
                    return Result<UploadImageResponseDto>.WithError(ResultConstants.NoPictureSet);

                var imageId = user.ProfilePictureId.Value;

                user.ProfilePictureId = null;
                await unitOfWork.UserRepository.Update(user, cancellationToken);

                await unitOfWork.ImageRepository.SoftDeleteAsync(imageId, cancellationToken);

                try
                {
                    await cache.RemoveAsync($"image:{imageId}", cancellationToken);
                }
                catch (Exception cacheEx)
                {
                    logger.LogWarning(cacheEx, "{class}.{method}: Cache eviction failed for image {imageId}, proceeding",
                        nameof(RemoveProfilePictureCommandHandler), nameof(Handle), imageId);
                }

                return Result<UploadImageResponseDto>.WithData(new UploadImageResponseDto { Id = imageId });
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning("{class}.{method}: Canceled for user {userId}",
                    nameof(RemoveProfilePictureCommandHandler), nameof(Handle), command.UserId);
                return Result<UploadImageResponseDto>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception for user {userId}",
                    nameof(RemoveProfilePictureCommandHandler), nameof(Handle), command.UserId);
                return Result<UploadImageResponseDto>.WithError(ResultConstants.InternalError);
            }
        }
    }
}
