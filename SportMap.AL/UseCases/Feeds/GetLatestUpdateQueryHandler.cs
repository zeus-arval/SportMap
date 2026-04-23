using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Feeds
{
    public class GetLatestUpdateQueryHandler(IUnitOfWork unitOfWork, ILogger<GetLatestUpdateQueryHandler> logger) : IQueryHandler<GetLatestUpdateQuery, DateTime?>
    {
        public async Task<Result<DateTime?>> Handle(GetLatestUpdateQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("{className}.{methodName}: Trying to retrieve latest update for place {placeId}", nameof(GetLatestUpdateQueryHandler), nameof(Handle), query.PlaceId);

            try
            {
                var posts = await unitOfWork.PostRepository.FindAsync(p => p.PlaceId == query.PlaceId && p.Status == StatusType.Verified, cancellationToken);
                
                if (posts.Count == 0)
                {
                    return Result<DateTime?>.WithData(null);
                }

                var latestUpdate = posts
                    .Select(p => p.ModifiedAt ?? p.CreatedAt)
                    .Max();

                return Result<DateTime?>.WithData(latestUpdate);
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{class}.{method}: Operation was canceled.", nameof(GetLatestUpdateQueryHandler), nameof(Handle));
                return Result<DateTime?>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception {message}", nameof(GetLatestUpdateQueryHandler), nameof(Handle), e.Message);
                return Result<DateTime?>.WithError(e.Message);
            }
        }
    }

    public record GetLatestUpdateQuery(Guid PlaceId) : IQuery<DateTime?>;
}
