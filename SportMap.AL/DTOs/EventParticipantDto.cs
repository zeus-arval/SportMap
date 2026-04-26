namespace SportMap.AL.DTOs
{
    public class EventParticipantDto
    {
        public Guid UserId { get; init; }
        public string UserName { get; init; } = string.Empty;
        public DateTime JoinedAt { get; init; }
    }
}
