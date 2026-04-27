using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SportMap.AL.Abstractions.Services;
using StackExchange.Redis;

namespace SportMap.DAL.Cache
{
    public sealed class RedisCacheService(IConnectionMultiplexer connectionMultiplexer, ILogger<RedisCacheService> logger) : ICacheService
    {
        private static class LogMessages
        {
            public const string RedisConnectionError = "{redisService}.{methodName}: Redis connection error: {key}";
            public const string RedisTimeoutError = "{redisService}.{methodName}: Redis timeout: {key}";
            public const string RedisError = "{redisService}.{methodName}: Redis error: {key}";
            public const string OperationCancelledWarning = "{redisService}.{methodName}: The request with key {key} to Redis was cancelled";
            public const string JsonSerializationError = "{redisService}.{methodName}: JSON deserialization error while getting value from cache: {message}";
        }

        private readonly ILogger _logger = logger;
        private readonly IDatabase _database = connectionMultiplexer.GetDatabase();

        public bool Exists(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                var exists = _database.KeyExists(key);
                return exists;
            }
            catch (RedisConnectionException e)
            {
                _logger.LogError(e, LogMessages.RedisConnectionError, nameof(RedisCacheService), nameof(Exists), key);
                return false;
            }
            catch (RedisTimeoutException e)
            {
                _logger.LogError(e, LogMessages.RedisTimeoutError, nameof(RedisCacheService), nameof(Exists), key);
                return false;
            }
            catch (RedisException e)
            {
                _logger.LogError(e, LogMessages.RedisError, nameof(RedisCacheService), nameof(Exists), key);
                return false;
            }
            catch (OperationCanceledException e)
            {
                _logger.LogWarning(e, LogMessages.OperationCancelledWarning, nameof(RedisCacheService), nameof(Exists), key);
                return false;
            }
        }

        public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                var value = await _database.StringGetAsync(key);

                if (value.HasValue)
                {
                    var json = value.ToString();
                    return JsonConvert.DeserializeObject<T>(json);
                }
            }
            catch (RedisConnectionException e)
            {
                _logger.LogError(e, LogMessages.RedisConnectionError, nameof(RedisCacheService), nameof(GetAsync), key);
            }
            catch (JsonSerializationException e)
            {
                _logger.LogError(e, LogMessages.JsonSerializationError, nameof(RedisCacheService), nameof(GetAsync), e.Message);
            }
            catch (RedisTimeoutException e)
            {
                _logger.LogError(e, LogMessages.RedisTimeoutError, nameof(RedisCacheService), nameof(GetAsync), key);
            }
            catch (RedisException e)
            {
                _logger.LogError(e, LogMessages.RedisError, nameof(RedisCacheService), nameof(GetAsync), key);
            }
            catch (OperationCanceledException e)
            {
                _logger.LogWarning(e, LogMessages.OperationCancelledWarning, nameof(RedisCacheService), nameof(GetAsync), key);
            }

            return default;
        }

        public async Task<bool> SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken cancellationToken = default)
        {
            try
            {
                var json = JsonConvert.SerializeObject(value);
                return await _database.StringSetAsync(key, json, ttl);
            }
            catch (RedisConnectionException e)
            {
                _logger.LogError(e, LogMessages.RedisConnectionError, nameof(RedisCacheService), nameof(SetAsync), key);
            }
            catch (RedisTimeoutException e)
            {
                _logger.LogError(e, LogMessages.RedisTimeoutError, nameof(RedisCacheService), nameof(SetAsync), key);
            }
            catch (JsonSerializationException e)
            {
                _logger.LogError(e, LogMessages.JsonSerializationError, nameof(RedisCacheService), nameof(GetAsync), e.Message);
            }
            catch (RedisException e)
            {
                _logger.LogError(e, LogMessages.RedisError, nameof(RedisCacheService), nameof(SetAsync), key);
            }
            catch (OperationCanceledException e)
            {
                _logger.LogWarning(e, LogMessages.OperationCancelledWarning, nameof(RedisCacheService), nameof(SetAsync), key);
            }

            return false;
        }

        public async Task<bool> RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _database.KeyDeleteAsync(key);
            }
            catch (RedisConnectionException e)
            {
                _logger.LogError(e, LogMessages.RedisConnectionError, nameof(RedisCacheService), nameof(RemoveAsync), key);
            }
            catch (RedisTimeoutException e)
            {
                _logger.LogError(e, LogMessages.RedisTimeoutError, nameof(RedisCacheService), nameof(RemoveAsync), key);
            }
            catch (RedisException e)
            {
                _logger.LogError(e, LogMessages.RedisError, nameof(RedisCacheService), nameof(RemoveAsync), key);
            }
            catch (OperationCanceledException e)
            {
                _logger.LogWarning(e, LogMessages.OperationCancelledWarning, nameof(RedisCacheService), nameof(RemoveAsync), key);
            }

            return false;
        }
    }
}
