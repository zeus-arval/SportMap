using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;
using SportMap.DAL.Specifications;

namespace SportMap.DAL.Repositories
{
    public class ImageRepository(AppDbContext context, ILogger<ImageRepository> logger)
        : BaseRepository<ImageData>(context, logger, context.Images), IImageRepository
    {
        public Task<ImageData?> GetImage(GetImageParameters parameters, CancellationToken ct = default)
        {
            var specification = new ImageSpecification(parameters);

            if (!parameters.Id.HasValue)
            {
                logger.LogWarning("{class}.{method}: No ID provided in parameters, returning null", nameof(ImageRepository), nameof(GetImage));
                return Task.FromResult<ImageData?>(null);
            }

            return GetByIdAsync(parameters.Id.Value, specification, ct);
        }

        public async Task SoftDeleteAsync(Guid id, CancellationToken ct = default)
        {
            var rowsAffected = await context.Images
                .Where(img => img.Id == id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(e => e.RemovedAt, DateTime.UtcNow)
                    .SetProperty(e => e.Status, StatusType.Removed), ct);

            if (rowsAffected == 0)
                logger.LogWarning("{class}.{method}: 0 rows updated for image {id} — possible data inconsistency",
                    nameof(ImageRepository), nameof(SoftDeleteAsync), id);
        }
    }
}
