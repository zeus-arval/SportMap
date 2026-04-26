using DomainLayer.Entities;

namespace SportMap.DAL.Extensions;

public static class QueryableGeoExtensions
{
    /// <summary>
    /// Earth's mean radius in kilometres (WGS-84).
    /// </summary>
    private const double EarthRadiusKm = 6371.0;

    /// <summary>
    /// Filters events whose associated <see cref="Place"/> falls within
    /// <paramref name="radiusKm"/> of the given coordinates using the
    /// Haversine formula. The expression is translated to SQL by EF Core.
    /// </summary>
    public static IQueryable<Event> WithinRadius(
        this IQueryable<Event> query,
        double lat,
        double lng,
        double radiusKm)
    {
        return query.Where(e =>
            EarthRadiusKm * 2.0 * Math.Atan2(
                Math.Sqrt(
                    Math.Sin((e.Place.Latitude - lat) * Math.PI / 180.0 / 2.0) *
                    Math.Sin((e.Place.Latitude - lat) * Math.PI / 180.0 / 2.0) +
                    Math.Cos(lat * Math.PI / 180.0) *
                    Math.Cos(e.Place.Latitude * Math.PI / 180.0) *
                    Math.Sin((e.Place.Longitude - lng) * Math.PI / 180.0 / 2.0) *
                    Math.Sin((e.Place.Longitude - lng) * Math.PI / 180.0 / 2.0)
                ),
                Math.Sqrt(
                    1.0 - (
                        Math.Sin((e.Place.Latitude - lat) * Math.PI / 180.0 / 2.0) *
                        Math.Sin((e.Place.Latitude - lat) * Math.PI / 180.0 / 2.0) +
                        Math.Cos(lat * Math.PI / 180.0) *
                        Math.Cos(e.Place.Latitude * Math.PI / 180.0) *
                        Math.Sin((e.Place.Longitude - lng) * Math.PI / 180.0 / 2.0) *
                        Math.Sin((e.Place.Longitude - lng) * Math.PI / 180.0 / 2.0)
                    )
                )
            ) <= radiusKm
        );
    }
}
