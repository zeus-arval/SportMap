using DomainLayer.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions;
using SportMap.DAL.DataContext;
using System.Linq.Expressions;

namespace SportMap.DAL.Common
{
    public abstract class BaseRepository<TData>(AppDbContext context, ILogger logger, DbSet<TData> dbSet) : IRepository<TData>
        where TData : BaseEntity
    {
        private readonly AppDbContext _context = context;
        protected readonly ILogger _logger = logger;
        protected readonly DbSet<TData> _dbSet = dbSet;

        public async Task<TData?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            try
            {
                var entity = await _dbSet.FindAsync(new object[] { id }, ct).ConfigureAwait(false);

                if (entity is null)
                {
                    logger.LogInformation($"{nameof(BaseRepository<TData>)}.{nameof(GetByIdAsync)}: Entity was not found");
                }

                return entity;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"{nameof(BaseRepository<TData>)}.{nameof(GetByIdAsync)}");
                throw;
            }
        }

        public async Task<IReadOnlyList<TData>> GetAllAsync(CancellationToken ct = default, params Expression<Func<TData, object>>[] includes)
        {
            try
            {
                var query = _dbSet.AsNoTracking();
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
                var entities = await query.ToListAsync(ct);
                return entities.AsReadOnly();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"{nameof(BaseRepository<TData>)}.{nameof(GetAllAsync)}");
                throw;
            }
        }

        public async Task<IReadOnlyList<TData>> FindAsync(Expression<Func<TData, bool>> predicate, CancellationToken ct = default)
        {
            try
            {
                var entities = await _dbSet.AsNoTracking().Where(predicate).ToListAsync(ct);
                return entities.AsReadOnly();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"{nameof(BaseRepository<TData>)}.{nameof(FindAsync)}");
                throw;
            }
        }

        public async Task<TData> AddAsync(TData entity, CancellationToken ct = default)
        {
            try
            {
                await _dbSet.AddAsync(entity, ct);
                await context.SaveChangesAsync(ct);

                return entity;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"{nameof(BaseRepository<TData>)}.{nameof(AddAsync)}");
                throw;
            }
        }

        public async Task AddRangeAsync(IEnumerable<TData> entities, CancellationToken ct = default)
        {
            try
            {
                await _dbSet.AddRangeAsync(entities, ct);
                await context.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"{nameof(BaseRepository<TData>)}.{nameof(AddRangeAsync)}");
                throw;
            }
        }

        public async Task Update(TData entity, CancellationToken ct = default)
        {
            try
            {
                _dbSet.Update(entity);
                await context.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"{nameof(BaseRepository<TData>)}.{nameof(Update)}");
                throw;
            }
        }

        public async Task Remove(TData entity, CancellationToken ct = default)
        {
            try
            {
                _dbSet.Remove(entity);
                await context.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"{nameof(BaseRepository<TData>)}.{nameof(Remove)}");
                throw;
            }
        }

        public async Task RemoveRange(IEnumerable<TData> entities, CancellationToken ct = default)
        {
            try
            {
                _dbSet.RemoveRange(entities);
                await context.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"{nameof(BaseRepository<TData>)}.{nameof(RemoveRange)}");
                throw;
            }
        }
    }
}
