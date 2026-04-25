using DomainLayer.Entities;

namespace SportMap.DAL.Abstractions.Repositories
{
    public interface IPrivacyTypeRepository : IRepository<PrivacyType>
    {
        Task<PrivacyType?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    }
}
