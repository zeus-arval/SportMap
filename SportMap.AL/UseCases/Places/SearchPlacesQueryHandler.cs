using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Places
{
    public class SearchPlacesQueryHandler(IUnitOfWork unitOfWork, ILogger<SearchPlacesQueryHandler> logger) : IQueryHandler<SearchPlacesQuery, IReadOnlyList<PlaceDto>>
    {
        public async Task<Result<IReadOnlyList<PlaceDto>>> Handle(SearchPlacesQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("{className}.{methodName}: Searching places with term '{SearchTerm}'", nameof(SearchPlacesQueryHandler), nameof(Handle), query.SearchTerm);

            if (string.IsNullOrWhiteSpace(query.SearchTerm) || query.SearchTerm.Length < 2)
            {
                return Result<IReadOnlyList<PlaceDto>>.WithData(Array.Empty<PlaceDto>());
            }

            try
            {
                var placeData = await unitOfWork.PlaceRepository.GetAllAsync(cancellationToken, place => place.PlaceType);
                var searchTerm = query.SearchTerm.ToLower();

                var filteredPlaces = placeData
                    .Where(place => place.Status == StatusType.Verified)
                    .Where(place => 
                        place.Name.ToLower().Contains(searchTerm) ||
                        (place.Address != null && place.Address.ToLower().Contains(searchTerm)) ||
                        place.PlaceType.Name.ToLower().Contains(searchTerm))
                    .Take(10);

                var places = filteredPlaces
                    .Select(place => place.Map())
                    .ToList()
                    .AsReadOnly();

                return Result<IReadOnlyList<PlaceDto>>.WithData(places);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception {message}", nameof(SearchPlacesQueryHandler), nameof(Handle), e.Message);
                return Result<IReadOnlyList<PlaceDto>>.WithError(e.Message);
            }
        }
    }
}
