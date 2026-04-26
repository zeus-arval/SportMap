using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Events
{
    public record GetFilteredEventsQuery(EventFilter Filter) : IQuery<IReadOnlyList<EventDto>>;

    public class GetFilteredEventsQueryHandler(
        IEventRepository eventRepository,
        ILogger<GetFilteredEventsQueryHandler> logger) : IQueryHandler<GetFilteredEventsQuery, IReadOnlyList<EventDto>>
    {
        public async Task<Result<IReadOnlyList<EventDto>>> Handle(GetFilteredEventsQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation(
                "{Class}.{Method}: Filtering events (lat={Lat}, lng={Lng}, radius={Radius}km, from={From}, to={To})",
                nameof(GetFilteredEventsQueryHandler), nameof(Handle),
                query.Filter.Latitude, query.Filter.Longitude, query.Filter.RadiusKm,
                query.Filter.DateFrom, query.Filter.DateTo);

            try
            {
                var events = await eventRepository.GetUpcomingFilteredAsync(query.Filter, cancellationToken);

                var dtos = events
                    .Select(e => e.Map(includeParticipants: true))
                    .ToList()
                    .AsReadOnly();

                return Result<IReadOnlyList<EventDto>>.WithData(dtos);
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{Class}.{Method}: Operation was canceled.",
                    nameof(GetFilteredEventsQueryHandler), nameof(Handle));
                return Result<IReadOnlyList<EventDto>>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{Class}.{Method}: Unhandled exception {Message}",
                    nameof(GetFilteredEventsQueryHandler), nameof(Handle), e.Message);
                return Result<IReadOnlyList<EventDto>>.WithError(e.Message);
            }
        }
    }
}
