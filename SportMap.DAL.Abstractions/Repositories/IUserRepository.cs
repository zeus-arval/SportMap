using DomainLayer.Entities;

namespace SportMap.DAL.Abstractions.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetUserById(Guid id, GetUsersParameters parameters, CancellationToken cancellationToken = default);
        Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default);
        Task<User?> GetByUserNameAsync(string username, CancellationToken cancellationToken = default);
        Task<User?> GetByIdWithProfileAsync(Guid id, CancellationToken cancellationToken = default);
        Task<User?> GetByUsernameWithProfileAsync(string username, CancellationToken cancellationToken = default);
    }

    public readonly record struct GetUsersParameters(Guid Id, string? BirthdatePrivacy);
}
