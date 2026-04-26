using DomainLayer.Entities;

namespace SportMap.DAL.Abstractions.Repositories
{
    public interface IPersonalizationRepository : IRepository<Personalization>
    {
        Task<Personalization?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
