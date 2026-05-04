namespace SportMap.AL.DTOs
{
    public class CreatePlaceRequest
    {
        public string Name { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public Guid PlaceTypeId { get; init; }
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string? Address { get; init; }
        public Guid CreatorId { get; init; }
    }
}