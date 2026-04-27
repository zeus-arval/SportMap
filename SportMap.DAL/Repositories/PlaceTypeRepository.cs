using DomainLayer.Entities;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;
using SportMap.DAL.Specifications;

namespace SportMap.DAL.Repositories
{
    public class PlaceTypeRepository(AppDbContext context, ILogger<PlaceTypeRepository> logger)
        : BaseRepository<PlaceType>(context, logger, context.PlaceTypes), IPlaceTypeRepository
    {
        public Task<IReadOnlyList<PlaceType>> GetAllPlaceTypes(CancellationToken ct = default)
        {
            return GetAllAsync(new PlaceTypeSpecification(), ct);
        }
    }
}
