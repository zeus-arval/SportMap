using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Images
{
    public record UploadProfilePictureCommand(
        Stream FileStream,
        string FileName,
        long FileSize,
        Guid UploaderId
    ) : ICommand<UploadImageResponseDto>;

    public class UploadProfilePictureCommandHandler(
        IUnitOfWork unitOfWork,
        IImageStorageService storageService,
        IOptions<ImageStorageOptions> options,
        ICacheService cache,
        ILogger<UploadProfilePictureCommandHandler> logger
    ) : ICommandHandler<UploadProfilePictureCommand, UploadImageResponseDto>
    {
        public async Task<Result<UploadImageResponseDto>> Handle(
            UploadProfilePictureCommand command,
            CancellationToken cancellationToken)
        {
            try
            {
                if (command.FileSize > options.Value.MaxFileSizeBytes)
                    return Result<UploadImageResponseDto>.WithError(
                        string.Format(ResultConstants.FileTooLarge, command.FileName));

                using var ms = new MemoryStream();
                await command.FileStream.CopyToAsync(ms, cancellationToken);
                ms.Position = 0;

                if (ms.Length > options.Value.MaxFileSizeBytes)
                    return Result<UploadImageResponseDto>.WithError(
                        string.Format(ResultConstants.FileTooLarge, command.FileName));

                var header = new byte[8];
                var bytesRead = await ms.ReadAsync(header, cancellationToken);
                ms.Position = 0;

                bool isJpeg = bytesRead >= 2 && header[0] == 0xFF && header[1] == 0xD8;
                bool isPng = bytesRead >= 4 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
                if (!isJpeg && !isPng)
                    return Result<UploadImageResponseDto>.WithError(
                        string.Format(ResultConstants.InvalidMimeType, command.FileName));

                var imageId = Guid.NewGuid();
                var path = Path.Join(options.Value.BasePath, imageId.ToString());

                try
                {
                    await storageService.WriteAsync(ms, path);
                }
                catch (ImageStorageException)
                {
                    return Result<UploadImageResponseDto>.WithError(ResultConstants.StorageUnavailable);
                }

                var safeFileName = Path.GetFileName(command.FileName);
                var imageData = new ImageData
                {
                    Id = imageId,
                    Name = safeFileName,
                    Path = path,
                    EntityId = command.UploaderId,
                    UploaderId = command.UploaderId,
                    ReviewerId = null,
                    Status = StatusType.Verified
                };

                try
                {
                    await unitOfWork.ImageRepository.AddAsync(imageData, cancellationToken);
                }
                catch (Exception e) when (e is not OperationCanceledException)
                {
                    logger.LogError(e, "{class}.{method}: Failed to save ImageData for {imageId}, cleaning up file",
                        nameof(UploadProfilePictureCommandHandler), nameof(Handle), imageId);
                    try { await storageService.DeleteAsync(path); } catch (Exception de)
                    {
                        logger.LogError(de, "{class}.{method}: Cleanup failed for orphaned file {path}",
                            nameof(UploadProfilePictureCommandHandler), nameof(Handle), path);
                    }
                    return Result<UploadImageResponseDto>.WithError(ResultConstants.InternalError);
                }

                var user = await unitOfWork.UserRepository.GetByIdAsync(command.UploaderId, ct: cancellationToken);
                if (user is null)
                {
                    logger.LogError("{class}.{method}: User {userId} not found, cleaning up image and file",
                        nameof(UploadProfilePictureCommandHandler), nameof(Handle), command.UploaderId);
                    try { await unitOfWork.ImageRepository.Remove(imageData, cancellationToken); } catch { /* best effort */ }
                    try { await storageService.DeleteAsync(path); } catch (Exception de)
                    {
                        logger.LogError(de, "{class}.{method}: Cleanup failed for orphaned file {path}",
                            nameof(UploadProfilePictureCommandHandler), nameof(Handle), path);
                    }
                    return Result<UploadImageResponseDto>.WithError(
                        string.Format(ResultConstants.NotFound, command.UploaderId));
                }

                user.ProfilePictureId = imageId;
                try
                {
                    await unitOfWork.UserRepository.Update(user, cancellationToken);
                }
                catch (Exception e) when (e is not OperationCanceledException)
                {
                    logger.LogError(e, "{class}.{method}: Failed to update User {userId}, cleaning up image and file",
                        nameof(UploadProfilePictureCommandHandler), nameof(Handle), command.UploaderId);
                    try { await unitOfWork.ImageRepository.Remove(imageData, cancellationToken); } catch { /* best effort */ }
                    try { await storageService.DeleteAsync(path); } catch (Exception de)
                    {
                        logger.LogError(de, "{class}.{method}: Cleanup failed for orphaned file {path}",
                            nameof(UploadProfilePictureCommandHandler), nameof(Handle), path);
                    }
                    return Result<UploadImageResponseDto>.WithError(ResultConstants.InternalError);
                }

                return Result<UploadImageResponseDto>.WithData(new UploadImageResponseDto { Id = imageId });
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled",
                    nameof(UploadProfilePictureCommandHandler), nameof(Handle));
                return Result<UploadImageResponseDto>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception",
                    nameof(UploadProfilePictureCommandHandler), nameof(Handle));
                return Result<UploadImageResponseDto>.WithError(ResultConstants.InternalError);
            }
        }
    }
}
