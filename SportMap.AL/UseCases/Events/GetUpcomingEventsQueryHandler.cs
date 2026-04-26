using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Events
{
    public record GetUpcomingEventsQuery(int Page, int PageSize) : IQuery<IReadOnlyList<EventDto>>;

    public class GetUpcomingEventsQueryHandler(
        IEventRepository eventRepository,
        ILogger<GetUpcomingEventsQueryHandler> logger) : IQueryHandler<GetUpcomingEventsQuery, IReadOnlyList<EventDto>>
    {
        public async Task<Result<IReadOnlyList<EventDto>>> Handle(GetUpcomingEventsQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("{Class}.{Method}: Retrieving upcoming events (page {Page}, size {PageSize})",
                nameof(GetUpcomingEventsQueryHandler), nameof(Handle), query.Page, query.PageSize);

            try
            {
                var events = await eventRepository.GetAllUpcomingAsync(query.Page, query.PageSize, cancellationToken);

                var dtos = events
                    .Select(e => e.Map(includeParticipants: true))
                    .ToList()
                    .AsReadOnly();

                return Result<IReadOnlyList<EventDto>>.WithData(dtos);
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{Class}.{Method}: Operation was canceled.",
                    nameof(GetUpcomingEventsQueryHandler), nameof(Handle));
                return Result<IReadOnlyList<EventDto>>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{Class}.{Method}: Unhandled exception {Message}",
                    nameof(GetUpcomingEventsQueryHandler), nameof(Handle), e.Message);
                return Result<IReadOnlyList<EventDto>>.WithError(e.Message);
            }
        }
    }
}
