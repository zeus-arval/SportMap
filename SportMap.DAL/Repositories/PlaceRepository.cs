using DomainLayer.Entities;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;

namespace SportMap.DAL.Repositories
{
    public class PlaceRepository(AppDbContext context, ILogger<PlaceRepository> logger) : BaseRepository<Place>(context, logger, context.Places), IPlaceRepository;
}
