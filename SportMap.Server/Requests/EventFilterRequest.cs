namespace SportMap.PL.Requests
{
    public class EventFilterRequest
    {
        public double? Lat { get; init; }
        public double? Lng { get; init; }
        public double? RadiusKm { get; init; }
        public DateTime? DateFrom { get; init; }
        public DateTime? DateTo { get; init; }
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 20;
    }
}
