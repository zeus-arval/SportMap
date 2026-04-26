using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;

namespace SportMap.DAL.Repositories
{
    public class PersonalizationRepository(AppDbContext context, ILogger<PersonalizationRepository> logger)
        : BaseRepository<Personalization>(context, logger, context.Personalization), IPersonalizationRepository
    {
        public async Task<Personalization?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _dbSet
                    .Include(p => p.BirthdatePrivacyType)
                    .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, $"{nameof(PersonalizationRepository)}.{nameof(GetByUserIdAsync)}");
                throw;
            }
        }
    }
}
