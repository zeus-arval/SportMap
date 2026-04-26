namespace SportMap.AL.DTOs
{
    public class CreateEventDto
    {
        public Guid PlaceId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string? Description { get; init; }
        public DateTime StartTime { get; init; }
        public int? Capacity { get; init; }
    }
}
