using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Feeds
{
    public record CreatePostCommand(string Content, string Title, Guid? AuthorId = null, Guid? PlaceId = null) : ICommand<PostDTO>;

    public class CreatePostCommandHandler(
        IUnitOfWork unitOfWork,
        ICacheService cache,
        ILogger<CreatePostCommandHandler> logger
    ) : ICommandHandler<CreatePostCommand, PostDTO>
    {
        public async Task<Result<PostDTO>> Handle(CreatePostCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var post = new DomainLayer.Entities.Post
                {
                    Id        = Guid.NewGuid(),
                    Title     = command.Title,
                    Content   = command.Content,
                    Status    = StatusType.Pending,
                    AuthorId  = command.AuthorId,
                    PlaceId   = command.PlaceId ?? Guid.Empty,
                    CreatedAt = DateTime.UtcNow,
                };

                var resultData = await unitOfWork.PostRepository.AddAsync(post, cancellationToken);
                await cache.SetAsync(resultData.Id.ToString(), resultData, TimeSpan.FromMinutes(20), cancellationToken);

                return Result<PostDTO>.WithData(resultData.Map());
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled",
                    nameof(CreatePostCommandHandler), nameof(Handle));
                return Result<PostDTO>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: {message}",
                    nameof(CreatePostCommandHandler), nameof(Handle), e.Message);
                return Result<PostDTO>.WithError(e.Message);
            }
        }
    }
}
