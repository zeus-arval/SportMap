using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;

namespace SportMap.AL.UseCases.PlaceTypes
{
    public record GetPlaceTypesQuery : IQuery<IReadOnlyList<PlaceTypeDto>>;
}