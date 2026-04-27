using SportMap.AL.Abstractions;
using DomainLayer.Entities;
using DomainLayer.Entities.Enums;

namespace SportMap.AL.DTOs
{
    public class PlaceDto : IDTO
    {
        public PlaceDto() { }

        public PlaceDto(Guid id, string name, string description, Guid placeTypeId, double latitude, double longitude, string? address, Guid? imageId, Guid creatorId, string creatorName, DateTime createdAt, DateTime? updatedAt, StatusType status)
        {
            Id = id;
            Name = name;
            Description = description;
            PlaceTypeId = placeTypeId;
            Latitude = latitude;
            Longitude = longitude;
            Address = address;
            ImageId = imageId;
            CreatorId = creatorId;
            CreatorName = creatorName;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
            Status = status.ToString();
        }

        public Guid Id { get; set; }
        public string Name { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public Guid PlaceTypeId { get; init; }
        public PlaceTypeDto? PlaceType { get; init; }
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string? Address { get; init; }
        public Guid? ImageId { get; init; }
        public Guid CreatorId { get; init; }
        public string CreatorName { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public DateTime? UpdatedAt { get; init; }
        public string Status { get; init; } = string.Empty;
    }
}