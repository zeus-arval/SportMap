using DomainLayer.Entities;
using DomainLayer.Entities.Enums;

namespace SportMap.DAL.Abstractions.Repositories
{
    public interface IPlaceRepository : IRepository<Place>
    {
        Task<IReadOnlyList<Place>> GetPlaces(GetPlaceParameters parameters, CancellationToken ct = default);
        Task<IReadOnlyList<Place>> SearchPlaces(SearchPlaceParameters parameters, CancellationToken ct = default);
    }

    public readonly record struct GetPlaceParameters(Guid? Id, StatusType? Status, Guid? PlaceTypeId);
    public readonly record struct SearchPlaceParameters(string SearchTerm, StatusType? Status);
}
