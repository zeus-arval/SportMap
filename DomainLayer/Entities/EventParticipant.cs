using DomainLayer.Common;

namespace DomainLayer.Entities
{
    public class EventParticipant : BaseEntity
    {
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public Event Event { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
