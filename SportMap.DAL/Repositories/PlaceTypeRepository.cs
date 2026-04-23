using DomainLayer.Entities;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;

namespace SportMap.DAL.Repositories
{
    public class PlaceTypeRepository(AppDbContext context, ILogger<PlaceTypeRepository> logger) : BaseRepository<PlaceType>(context, logger, context.PlaceTypes), IPlaceTypeRepository;
}