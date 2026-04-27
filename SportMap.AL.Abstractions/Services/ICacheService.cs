namespace SportMap.AL.Abstractions.Services
{
    public interface ICacheService
    {
        bool Exists(string key, CancellationToken cancellationToken = default);
        Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
        Task<bool> SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken cancellationToken = default);
        Task<bool> RemoveAsync(string key, CancellationToken cancellationToken = default);
    }
}
