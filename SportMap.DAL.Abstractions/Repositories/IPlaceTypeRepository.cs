using DomainLayer.Entities;

namespace SportMap.DAL.Abstractions.Repositories
{
    public interface IPlaceTypeRepository : IRepository<PlaceType>
    {
        Task<IReadOnlyList<PlaceType>> GetAllPlaceTypes(CancellationToken ct = default);
    }
}