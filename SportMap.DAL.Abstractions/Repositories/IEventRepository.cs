using DomainLayer.Entities;

namespace SportMap.DAL.Abstractions.Repositories
{
    public interface IEventRepository : IRepository<Event>
    {
        Task<IReadOnlyList<Event>> GetAllUpcomingAsync(int page, int pageSize, CancellationToken ct = default);
        Task<IReadOnlyList<Event>> GetUpcomingFilteredAsync(EventFilter filter, CancellationToken ct = default);
        Task<IReadOnlyList<Event>> GetUpcomingByPlaceIdAsync(Guid placeId, int page, int pageSize, CancellationToken ct = default);
        Task<Event?> GetByIdWithParticipantsAsync(Guid id, CancellationToken ct = default);
        Task<EventParticipant?> GetParticipantAsync(Guid eventId, Guid userId, CancellationToken ct = default);
        Task<EventParticipant> AddParticipantAsync(EventParticipant participant, CancellationToken ct = default);
        Task RemoveParticipantAsync(EventParticipant participant, CancellationToken ct = default);
    }
}
