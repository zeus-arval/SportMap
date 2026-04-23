using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using SportMap.AL.DTOs;

namespace SportMap.AL.UseCases.Places
{
    internal static class PlaceExtensions
    {
        extension(Place place)
        {
            public PlaceDto Map()
            {
                return new PlaceDto
                {
                    Id = place.Id,
                    Name = place.Name,
                    Description = place.Description,
                    PlaceTypeId = place.PlaceTypeId,
                    Latitude = place.Latitude,
                    Longitude = place.Longitude,
                    Address = place.Address,
                    ImageId = place.ImageId,
                    CreatorId = place.CreatorId,
                    CreatorName = string.Empty,
                    CreatedAt = place.CreatedAt,
                    UpdatedAt = place.ModifiedAt,
                    Status = place.Status.ToString(),
                    PlaceType = place.PlaceType != null ? place.PlaceType.Map() : null
                };
            }
        }

        extension(PlaceDto dto)
        {
            public Place Map()
            {
                return new Place
                {
                    Id = dto.Id,
                    Name = dto.Name,
                    Description = dto.Description,
                    PlaceTypeId = dto.PlaceTypeId,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    Address = dto.Address,
                    ImageId = dto.ImageId,
                    CreatorId = dto.CreatorId,
                    Status = Enum.Parse<StatusType>(dto.Status)
                };
            }
        }

        extension(PlaceType placeType)
        {
            public PlaceTypeDto Map()
            {
                return new PlaceTypeDto
                {
                    Id = placeType.Id,
                    Name = placeType.Name,
                    Description = placeType.Description
                };
            }
        }

        extension(PlaceTypeDto dto)
        {
            public PlaceType Map()
            {
                return new PlaceType
                {
                    Id = dto.Id,
                    Name = dto.Name,
                    Description = dto.Description
                };
            }
        }
    }
}