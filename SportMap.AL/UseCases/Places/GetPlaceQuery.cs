using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;

namespace SportMap.AL.UseCases.Places
{
    public record GetPlaceQuery(Guid? Id, StatusType Status, Guid? PlaceTypeId) : IQuery<IReadOnlyList<PlaceDto>>;
}
