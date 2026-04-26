using SportMap.AL.Abstractions;

namespace SportMap.AL.DTOs
{
    public class EventDto : IDTO
    {
        public Guid Id { get; set; }
        public Guid PlaceId { get; init; }
        public Guid HostUserId { get; init; }
        public string HostUserName { get; init; } = string.Empty;
        public string Title { get; init; } = string.Empty;
        public string? Description { get; init; }
        public DateTime StartTime { get; init; }
        public int? Capacity { get; init; }
        public int ParticipantCount { get; init; }
        public DateTime CreatedAt { get; init; }
        public string Status { get; init; } = string.Empty;
        public IReadOnlyList<EventParticipantDto>? Participants { get; init; }
    }
}
