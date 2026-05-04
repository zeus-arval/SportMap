using DomainLayer.Common;

namespace SportMap.DAL.Abstractions
{
    public interface IRepository<TData> where TData : BaseEntity
    {
        Task<TData?> GetByIdAsync(Guid id, ISpecification<TData> specification = default, CancellationToken ct = default);
        Task<IReadOnlyList<TData>> GetAllAsync(ISpecification<TData> specification, CancellationToken ct = default);
        Task<IReadOnlyList<TData>> FindAsync(ISpecification<TData> specification, CancellationToken ct = default);
        Task<TData> AddAsync(TData entity, CancellationToken ct = default);
        Task AddRangeAsync(IEnumerable<TData> entities, CancellationToken ct = default);
        Task Update(TData entity, CancellationToken ct = default);
        Task Remove(TData entity, CancellationToken ct = default);
        Task RemoveRange(IEnumerable<TData> entities, CancellationToken ct = default);
    }
}
