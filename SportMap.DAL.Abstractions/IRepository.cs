using DomainLayer.Common;
using System.Linq.Expressions;

namespace SportMap.DAL.Abstractions
{
    public interface IRepository<TData> where TData : BaseEntity
    {
        Task<TData?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<IReadOnlyList<TData>> GetAllAsync(CancellationToken ct = default, params Expression<Func<TData, object>>[] includes);
        Task<IReadOnlyList<TData>> FindAsync(Expression<Func<TData, bool>> predicate, CancellationToken ct = default);
        Task<TData> AddAsync(TData entity, CancellationToken ct = default);
        Task AddRangeAsync(IEnumerable<TData> entities, CancellationToken ct = default);
        Task Update(TData entity, CancellationToken ct = default);
        Task Remove(TData entity, CancellationToken ct = default);
        Task RemoveRange(IEnumerable<TData> entities, CancellationToken ct = default);
    }
}
