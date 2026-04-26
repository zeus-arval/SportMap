using DomainLayer.Entities;
using SportMap.AL.DTOs;

namespace SportMap.AL.UseCases.Events
{
    internal static class EventExtensions
    {
        extension(Event e)
        {
            public EventDto Map(bool includeParticipants = false)
            {
                return new EventDto
                {
                    Id = e.Id,
                    PlaceId = e.PlaceId,
                    HostUserId = e.HostUserId,
                    HostUserName = e.HostUser is not null ? $"{e.HostUser.FirstName} {e.HostUser.LastName}" : string.Empty,
                    Title = e.Title,
                    Description = e.Description,
                    StartTime = e.StartTime,
                    Capacity = e.Capacity,
                    ParticipantCount = e.Participants?.Count ?? 0,
                    CreatedAt = e.CreatedAt,
                    Status = e.Status.ToString(),
                    Participants = includeParticipants
                        ? e.Participants?.Select(p => p.Map()).ToList().AsReadOnly()
                        : null
                };
            }
        }

        extension(EventParticipant p)
        {
            public EventParticipantDto Map()
            {
                return new EventParticipantDto
                {
                    UserId = p.UserId,
                    UserName = p.User is not null ? $"{p.User.FirstName} {p.User.LastName}" : string.Empty,
                    JoinedAt = p.CreatedAt
                };
            }
        }
    }
}
