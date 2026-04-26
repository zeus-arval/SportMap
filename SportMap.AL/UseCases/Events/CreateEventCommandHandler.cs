using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Events
{
    public record CreateEventCommand(
        Guid HostUserId,
        Guid PlaceId,
        string Title,
        string? Description,
        DateTime StartTime,
        int? Capacity
    ) : ICommand<EventDto>;

    public class CreateEventCommandHandler(
        IEventRepository eventRepository,
        ILogger<CreateEventCommandHandler> logger) : ICommandHandler<CreateEventCommand, EventDto>
    {
        public async Task<Result<EventDto>> Handle(CreateEventCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("{Class}.{Method}: Creating event '{Title}'",
                nameof(CreateEventCommandHandler), nameof(Handle), command.Title);

            try
            {
                if (string.IsNullOrWhiteSpace(command.Title))
                    return Result<EventDto>.WithError("Title is required.");

                if (command.PlaceId == Guid.Empty)
                    return Result<EventDto>.WithError("PlaceId is required.");

                if (command.StartTime <= DateTime.UtcNow)
                    return Result<EventDto>.WithError("StartTime must be in the future.");

                if (command.Capacity.HasValue && command.Capacity.Value <= 0)
                    return Result<EventDto>.WithError("Capacity must be greater than zero.");

                var eventEntity = new Event
                {
                    Id = Guid.NewGuid(),
                    PlaceId = command.PlaceId,
                    HostUserId = command.HostUserId,
                    Title = command.Title,
                    Description = command.Description,
                    StartTime = command.StartTime,
                    Capacity = command.Capacity,
                    Status = EventStatus.Active,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await eventRepository.AddAsync(eventEntity, cancellationToken);
                var withDetails = await eventRepository.GetByIdWithParticipantsAsync(created.Id, cancellationToken);

                if (withDetails is null)
                    return Result<EventDto>.WithError("Failed to retrieve created event.");

                return Result<EventDto>.WithData(withDetails.Map());
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{Class}.{Method}: Operation was canceled.",
                    nameof(CreateEventCommandHandler), nameof(Handle));
                return Result<EventDto>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{Class}.{Method}: Unhandled exception {Message}",
                    nameof(CreateEventCommandHandler), nameof(Handle), e.Message);
                return Result<EventDto>.WithError(e.Message);
            }
        }
    }
}
