using DomainLayer.Entities;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;
using SportMap.DAL.Specifications;

namespace SportMap.DAL.Repositories
{
    public class PlaceRepository(AppDbContext context, ILogger<PlaceRepository> logger)
        : BaseRepository<Place>(context, logger, context.Places), IPlaceRepository
    {
        public async Task<IReadOnlyList<Place>> GetPlaces(GetPlaceParameters parameters, CancellationToken ct = default)
        {
            var specification = new PlaceSpecification(parameters);
            return await FindAsync(specification, ct);
        }

        public async Task<IReadOnlyList<Place>> SearchPlaces(SearchPlaceParameters parameters, CancellationToken ct = default)
        {
            var specification = new SearchPlaceSpecification(parameters);
            var results = await FindAsync(specification, ct);
            return results.Take(10).ToList().AsReadOnly();
        }
    }
}
