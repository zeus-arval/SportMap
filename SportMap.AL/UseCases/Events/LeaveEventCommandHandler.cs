using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Events
{
    public record LeaveEventCommand(Guid EventId, Guid UserId) : ICommand;

    public class LeaveEventCommandHandler(
        IEventRepository eventRepository,
        ILogger<LeaveEventCommandHandler> logger) : ICommandHandler<LeaveEventCommand>
    {
        public async Task<Result> Handle(LeaveEventCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("{Class}.{Method}: User {UserId} leaving event {EventId}",
                nameof(LeaveEventCommandHandler), nameof(Handle), command.UserId, command.EventId);

            try
            {
                var participant = await eventRepository.GetParticipantAsync(command.EventId, command.UserId, cancellationToken);

                if (participant is null)
                    return Result.WithError("User is not a participant of this event.");

                await eventRepository.RemoveParticipantAsync(participant, cancellationToken);
                return Result.Succeeded();
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{Class}.{Method}: Operation was canceled.",
                    nameof(LeaveEventCommandHandler), nameof(Handle));
                return Result.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{Class}.{Method}: Unhandled exception {Message}",
                    nameof(LeaveEventCommandHandler), nameof(Handle), e.Message);
                return Result.WithError(e.Message);
            }
        }
    }
}
