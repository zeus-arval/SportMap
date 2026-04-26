using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Events
{
    public record GetEventsByPlaceQuery(Guid PlaceId, int Page, int PageSize) : IQuery<IReadOnlyList<EventDto>>;

    public class GetEventsByPlaceQueryHandler(
        IEventRepository eventRepository,
        ILogger<GetEventsByPlaceQueryHandler> logger) : IQueryHandler<GetEventsByPlaceQuery, IReadOnlyList<EventDto>>
    {
        public async Task<Result<IReadOnlyList<EventDto>>> Handle(GetEventsByPlaceQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("{Class}.{Method}: Retrieving events for place {PlaceId}",
                nameof(GetEventsByPlaceQueryHandler), nameof(Handle), query.PlaceId);

            try
            {
                var events = await eventRepository.GetUpcomingByPlaceIdAsync(query.PlaceId, query.Page, query.PageSize, cancellationToken);

                var dtos = events
                    .Select(e => e.Map())
                    .ToList()
                    .AsReadOnly();

                return Result<IReadOnlyList<EventDto>>.WithData(dtos);
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{Class}.{Method}: Operation was canceled.",
                    nameof(GetEventsByPlaceQueryHandler), nameof(Handle));
                return Result<IReadOnlyList<EventDto>>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{Class}.{Method}: Unhandled exception {Message}",
                    nameof(GetEventsByPlaceQueryHandler), nameof(Handle), e.Message);
                return Result<IReadOnlyList<EventDto>>.WithError(e.Message);
            }
        }
    }
}
