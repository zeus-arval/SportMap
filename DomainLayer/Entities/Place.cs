using DomainLayer.Common;
using DomainLayer.Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace DomainLayer.Entities
{
    public class Place : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        [ForeignKey(nameof(PlaceType))]
        public Guid PlaceTypeId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Address { get; set; }
        public Guid? ImageId { get; set; }
        public Guid CreatorId { get; set; }
        public StatusType Status { get; set; } = StatusType.Pending;
        public Guid? ReviewerId { get; set; }

        public PlaceType? PlaceType { get; set; }
        public User Creator { get; set; } = null!;
        public User? Reviewer { get; set; }
    }
}