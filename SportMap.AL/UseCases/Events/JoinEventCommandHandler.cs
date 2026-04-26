using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Events
{
    public record JoinEventCommand(Guid EventId, Guid UserId) : ICommand;

    public class JoinEventCommandHandler(
        IEventRepository eventRepository,
        ILogger<JoinEventCommandHandler> logger) : ICommandHandler<JoinEventCommand>
    {
        public async Task<Result> Handle(JoinEventCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("{Class}.{Method}: User {UserId} joining event {EventId}",
                nameof(JoinEventCommandHandler), nameof(Handle), command.UserId, command.EventId);

            try
            {
                var eventEntity = await eventRepository.GetByIdWithParticipantsAsync(command.EventId, cancellationToken);

                if (eventEntity is null || eventEntity.Status != EventStatus.Active)
                    return Result.WithError("Event not found or not active.");

                if (eventEntity.StartTime < DateTime.UtcNow)
                    return Result.WithError("Event has already started.");

                if (eventEntity.Capacity.HasValue && eventEntity.Participants.Count >= eventEntity.Capacity.Value)
                    return Result.WithError("Event is at full capacity.");

                var existing = await eventRepository.GetParticipantAsync(command.EventId, command.UserId, cancellationToken);
                if (existing is not null)
                    return Result.WithError("User has already joined this event.");

                var participant = new EventParticipant
                {
                    Id = Guid.NewGuid(),
                    EventId = command.EventId,
                    UserId = command.UserId,
                    CreatedAt = DateTime.UtcNow
                };

                await eventRepository.AddParticipantAsync(participant, cancellationToken);
                return Result.Succeeded();
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{Class}.{Method}: Operation was canceled.",
                    nameof(JoinEventCommandHandler), nameof(Handle));
                return Result.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{Class}.{Method}: Unhandled exception {Message}",
                    nameof(JoinEventCommandHandler), nameof(Handle), e.Message);
                return Result.WithError(e.Message);
            }
        }
    }
}
