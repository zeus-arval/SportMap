namespace SportMap.DAL.Abstractions.Repositories
{
    public record EventFilter(
        double? Latitude = null,
        double? Longitude = null,
        double? RadiusKm = null,
        DateTime? DateFrom = null,
        DateTime? DateTo = null,
        int Page = 1,
        int PageSize = 20
    );
}
