using DomainLayer.Entities;

namespace SportMap.DAL.Abstractions
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default);
        Task<User?> GetByUserNameAsync(string username, CancellationToken cancellationToken = default);
        Task<User?> GetByIdWithProfileAsync(Guid id, CancellationToken cancellationToken = default);
        Task<User?> GetByUsernameWithProfileAsync(string username, CancellationToken cancellationToken = default);
    }
}
