using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.AL.Extensions;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Feeds
{
    public class GetPostQueryHandler(IUnitOfWork unitOfWork, ICacheService cache, ILogger<GetPostQueryHandler> logger) : IQueryHandler<GetPostQuery, IReadOnlyList<PostDTO>>
    {
        public async Task<Result<IReadOnlyList<PostDTO>>> Handle(GetPostQuery query, CancellationToken cancellationToken)
        {
            IReadOnlyList<PostDTO> posts;
            logger.LogInformation("{className}.{methodName}: Trying to retrieve posts", nameof(GetPostQueryHandler), nameof(Handle));

            try
            {
                var id = query.Id.ToString();
                if (query.Id != null && cache.ExistsAsync(id!))
                {
                    var post = await cache.GetAsync<PostDTO>(id!, cancellationToken);

                    return Result<IReadOnlyList<PostDTO>>.WithData(post.AsReadonlyList());
                }

                var postData= await unitOfWork.PostRepository.GetAllAsync(cancellationToken);
                var filteredPosts = postData
                    .Where(post => post.Status.Equals(query.Status))
                    .FilterIfNotNull(query.Id, (post, id) => post.Id == id)
                    .FilterIfNotNull(query.PlaceId, (post, placeId) => post.PlaceId == placeId)
                    .OrderByDescending(post => post.CreatedAt);

                posts = filteredPosts
                    .Select(post => post.Map())
                    .ToList()
                    .AsReadOnly();
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{class}.{method}: Operation was canceled.", nameof(GetPostQueryHandler), nameof(Handle));
                return Result<IReadOnlyList<PostDTO>>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception {message}", nameof(GetPostQueryHandler), nameof(Handle), e.Message);
                return Result<IReadOnlyList<PostDTO>>.WithError(e.Message);
            }

            return Result<IReadOnlyList<PostDTO>>.WithData(posts);
        }
    }

    public record GetPostQuery(Guid? Id, StatusType Status, Guid? PlaceId = null) : IQuery<IReadOnlyList<PostDTO>>;
}
