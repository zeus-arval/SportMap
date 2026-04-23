using DomainLayer.Entities;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;

namespace SportMap.AL.UseCases.Places
{
    public record SearchPlacesQuery(string SearchTerm) : IQuery<IReadOnlyList<PlaceDto>>;
}
