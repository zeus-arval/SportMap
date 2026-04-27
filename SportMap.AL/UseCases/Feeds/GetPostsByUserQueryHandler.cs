using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Feeds
{
    public record GetPostsByUserQuery(Guid AuthorId) : IQuery<IReadOnlyList<PostDto>>;

    public class GetPostsByUserQueryHandler(
        IUnitOfWork unitOfWork,
        ICacheService cache,
        ILogger<GetPostsByUserQueryHandler> logger
    ) : IQueryHandler<GetPostsByUserQuery, IReadOnlyList<PostDto>>
    {
        private static string CacheKey(Guid authorId) => $"user_posts:{authorId}";

        public async Task<Result<IReadOnlyList<PostDto>>> Handle(GetPostsByUserQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("{class}.{method}: Retrieving posts for author {AuthorId}",
                nameof(GetPostsByUserQueryHandler), nameof(Handle), query.AuthorId);

            try
            {
                var cacheKey = CacheKey(query.AuthorId);
                if (cache.Exists(cacheKey))
                {
                    var cached = await cache.GetAsync<IReadOnlyList<PostDto>>(cacheKey, cancellationToken);
                    if (cached is not null)
                        return Result<IReadOnlyList<PostDto>>.WithData(cached);
                }

                var posts = await unitOfWork.PostRepository.GetPosts(query.ToParameters(), cancellationToken);
                var dtos = posts
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => p.Map())
                    .ToList()
                    .AsReadOnly();

                await cache.SetAsync(cacheKey, dtos, TimeSpan.FromMinutes(5), cancellationToken);

                return Result<IReadOnlyList<PostDto>>.WithData(dtos);
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{class}.{method}: Operation was canceled.",
                    nameof(GetPostsByUserQueryHandler), nameof(Handle));
                return Result<IReadOnlyList<PostDto>>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception {message}",
                    nameof(GetPostsByUserQueryHandler), nameof(Handle), e.Message);
                return Result<IReadOnlyList<PostDto>>.WithError(ResultConstants.InternalError);
            }
        }
    }
}
