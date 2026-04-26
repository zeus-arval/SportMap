using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;

namespace SportMap.DAL.Repositories
{
    public class PrivacyTypeRepository(AppDbContext context, ILogger<PrivacyTypeRepository> logger)
        : BaseRepository<PrivacyType>(context, logger, context.PrivacyTypes), IPrivacyTypeRepository
    {
        public async Task<PrivacyType?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _dbSet
                    .FirstOrDefaultAsync(pt => pt.Name.ToLower() == name.ToLower(), cancellationToken);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, $"{nameof(PrivacyTypeRepository)}.{nameof(GetByNameAsync)}");
                throw;
            }
        }
    }
}
