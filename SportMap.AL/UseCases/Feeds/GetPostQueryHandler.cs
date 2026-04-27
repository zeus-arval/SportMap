using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.AL.Extensions;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Feeds
{
    public class GetPostQueryHandler(IUnitOfWork unitOfWork, ICacheService cache, ILogger<GetPostQueryHandler> logger) : IQueryHandler<GetPostQuery, IReadOnlyList<PostDto>>
    {
        public async Task<Result<IReadOnlyList<PostDto>>> Handle(GetPostQuery query, CancellationToken cancellationToken)
        {
            IReadOnlyList<PostDto> posts;
            logger.LogInformation("{className}.{methodName}: Trying to retrieve posts", nameof(GetPostQueryHandler), nameof(Handle));

            try
            {
                var id = query.Id.ToString();
                if (query.Id != null && cache.Exists(id!))
                {
                    var post = await cache.GetAsync<Post>(id!, cancellationToken);

                    return Result<IReadOnlyList<PostDto>>.WithData(post!.Map().AsReadonlyList());
                }

                var postData= await unitOfWork.PostRepository.GetPosts(query.ToParameters(), cancellationToken);
                var orderedPosts = postData
                    .OrderByDescending(post => post.CreatedAt);

                posts = orderedPosts
                    .Select(post => post.Map())
                    .ToList()
                    .AsReadOnly();
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{class}.{method}: Operation was canceled.", nameof(GetPostQueryHandler), nameof(Handle));
                return Result<IReadOnlyList<PostDto>>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception {message}", nameof(GetPostQueryHandler), nameof(Handle), e.Message);
                return Result<IReadOnlyList<PostDto>>.WithError(e.Message);
            }

            return Result<IReadOnlyList<PostDto>>.WithData(posts);
        }
    }

    public record GetPostQuery(Guid? Id, StatusType Status, Guid? PlaceId = null) : IQuery<IReadOnlyList<PostDto>>;
}
