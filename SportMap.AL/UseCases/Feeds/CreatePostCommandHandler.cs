using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Feeds
{
    public class CreatePostCommandHandler(IUnitOfWork unitOfWork, ICacheService cache, ILogger<CreatePostCommandHandler> logger) : ICommandHandler<CreatePostCommand, PostDTO>
    {
        public async Task<Result<PostDTO>> Handle(CreatePostCommand command, CancellationToken cancellationToken)
        {
            var post = new PostDTO(Guid.NewGuid(), command.Title, command.Content, StatusType.Verified, command.PlaceId, DateTime.UtcNow);
            
            try
            {
                var postData = post.Map();
                var resultData = await unitOfWork.PostRepository.AddAsync(postData, cancellationToken);
                await cache.SetAsync(resultData.Id.ToString(), resultData, TimeSpan.FromMinutes(20), cancellationToken);

                return Result<PostDTO>
                    .WithData(resultData.Map());
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled", nameof(CreatePostCommandHandler), nameof(Handle));
                return Result<PostDTO>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: {message}", nameof(CreatePostCommandHandler), nameof(Handle), e.Message);
                return Result<PostDTO>.WithError(e.Message);
            }
        }
    }

    public record CreatePostCommand(string Content, 
        string Title, Guid PlaceId) : ICommand<PostDTO>;
}
