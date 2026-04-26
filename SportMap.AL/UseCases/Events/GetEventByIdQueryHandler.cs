using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Events
{
    public record GetEventByIdQuery(Guid EventId) : IQuery<EventDto>;

    public class GetEventByIdQueryHandler(
        IEventRepository eventRepository,
        ILogger<GetEventByIdQueryHandler> logger) : IQueryHandler<GetEventByIdQuery, EventDto>
    {
        public async Task<Result<EventDto>> Handle(GetEventByIdQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("{Class}.{Method}: Retrieving event {EventId}",
                nameof(GetEventByIdQueryHandler), nameof(Handle), query.EventId);

            try
            {
                var eventEntity = await eventRepository.GetByIdWithParticipantsAsync(query.EventId, cancellationToken);

                if (eventEntity is null)
                    return Result<EventDto>.WithError($"Event {query.EventId} not found.");

                return Result<EventDto>.WithData(eventEntity.Map(includeParticipants: true));
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{Class}.{Method}: Operation was canceled.",
                    nameof(GetEventByIdQueryHandler), nameof(Handle));
                return Result<EventDto>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{Class}.{Method}: Unhandled exception {Message}",
                    nameof(GetEventByIdQueryHandler), nameof(Handle), e.Message);
                return Result<EventDto>.WithError(e.Message);
            }
        }
    }
}
