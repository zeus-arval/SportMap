using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;
using SportMap.DAL.Extensions;

namespace SportMap.DAL.DataAccess
{
    public class EventRepository(AppDbContext context, ILogger<EventRepository> logger)
        : BaseRepository<Event>(context, logger, context.Events), IEventRepository
    {
        public async Task<IReadOnlyList<Event>> GetAllUpcomingAsync(int page, int pageSize, CancellationToken ct = default)
        {
            try
            {
                var events = await _dbSet
                    .AsNoTracking()
                    .Include(e => e.HostUser)
                    .Include(e => e.Participants)
                    .Where(e => e.StartTime >= DateTime.UtcNow && e.Status == EventStatus.Active)
                    .OrderBy(e => e.StartTime)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync(ct);
                return events.AsReadOnly();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Repository}.{Method}", nameof(EventRepository), nameof(GetAllUpcomingAsync));
                throw;
            }
        }

        public async Task<IReadOnlyList<Event>> GetUpcomingFilteredAsync(EventFilter filter, CancellationToken ct = default)
        {
            try
            {
                var query = _dbSet
                    .AsNoTracking()
                    .Include(e => e.HostUser)
                    .Include(e => e.Participants)
                    .Include(e => e.Place)
                    .Where(e => e.Status == EventStatus.Active && e.StartTime >= DateTime.UtcNow);

                var dateFrom = filter.DateFrom;
                if (dateFrom is DateTime from)
                    query = query.Where(e => e.StartTime >= from);

                var dateTo = filter.DateTo;
                if (dateTo is DateTime to)
                    query = query.Where(e => e.StartTime <= to);

                // Distance filter — Haversine approximation in SQL
                if (filter.Latitude.HasValue && filter.Longitude.HasValue && filter.RadiusKm.HasValue)
                {
                    query = query.WithinRadius(
                        filter.Latitude.Value,
                        filter.Longitude.Value,
                        filter.RadiusKm.Value);
                }

                var events = await query
                    .OrderBy(e => e.StartTime)
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync(ct);

                return events.AsReadOnly();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Repository}.{Method}", nameof(EventRepository), nameof(GetUpcomingFilteredAsync));
                throw;
            }
        }

        public async Task<IReadOnlyList<Event>> GetUpcomingByPlaceIdAsync(Guid placeId, int page, int pageSize, CancellationToken ct = default)
        {
            try
            {
                var events = await _dbSet
                    .AsNoTracking()
                    .Include(e => e.HostUser)
                    .Include(e => e.Participants)
                    .Where(e => e.PlaceId == placeId && e.StartTime >= DateTime.UtcNow && e.Status == EventStatus.Active)
                    .OrderBy(e => e.StartTime)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync(ct);
                return events.AsReadOnly();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Repository}.{Method}", nameof(EventRepository), nameof(GetUpcomingByPlaceIdAsync));
                throw;
            }
        }

        public async Task<Event?> GetByIdWithParticipantsAsync(Guid id, CancellationToken ct = default)
        {
            try
            {
                return await _dbSet
                    .Include(e => e.HostUser)
                    .Include(e => e.Place)
                    .Include(e => e.Participants)
                        .ThenInclude(p => p.User)
                    .FirstOrDefaultAsync(e => e.Id == id, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Repository}.{Method}", nameof(EventRepository), nameof(GetByIdWithParticipantsAsync));
                throw;
            }
        }

        public async Task<EventParticipant?> GetParticipantAsync(Guid eventId, Guid userId, CancellationToken ct = default)
        {
            try
            {
                return await context.EventParticipants
                    .FirstOrDefaultAsync(ep => ep.EventId == eventId && ep.UserId == userId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Repository}.{Method}", nameof(EventRepository), nameof(GetParticipantAsync));
                throw;
            }
        }

        public async Task<EventParticipant> AddParticipantAsync(EventParticipant participant, CancellationToken ct = default)
        {
            try
            {
                await context.EventParticipants.AddAsync(participant, ct);
                await context.SaveChangesAsync(ct);
                return participant;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Repository}.{Method}", nameof(EventRepository), nameof(AddParticipantAsync));
                throw;
            }
        }

        public async Task RemoveParticipantAsync(EventParticipant participant, CancellationToken ct = default)
        {
            try
            {
                context.EventParticipants.Remove(participant);
                await context.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "{Repository}.{Method}", nameof(EventRepository), nameof(RemoveParticipantAsync));
                throw;
            }
        }
    }
}
