using DomainLayer.Common;
using DomainLayer.Entities.Enums;

namespace DomainLayer.Entities
{
    public class Event : BaseEntity
    {
        public Guid PlaceId { get; set; }
        public Guid HostUserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartTime { get; set; }
        public int? Capacity { get; set; }
        public EventStatus Status { get; set; } = EventStatus.Active;
        public Place Place { get; set; } = null!;
        public User HostUser { get; set; } = null!;
        public ICollection<EventParticipant> Participants { get; set; } = [];
    }
}
