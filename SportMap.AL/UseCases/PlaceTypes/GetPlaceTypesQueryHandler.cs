using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.AL.UseCases.Places;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.PlaceTypes
{
    public class GetPlaceTypesQueryHandler(IUnitOfWork unitOfWork, ILogger<GetPlaceTypesQueryHandler> logger) : IQueryHandler<GetPlaceTypesQuery, IReadOnlyList<PlaceTypeDto>>
    {
        public async Task<Result<IReadOnlyList<PlaceTypeDto>>> Handle(GetPlaceTypesQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("{className}.{methodName}: Trying to retrieve place types", nameof(GetPlaceTypesQueryHandler), nameof(Handle));

            try
            {
                var placeTypesData = await unitOfWork.PlaceTypeRepository.GetAllAsync(cancellationToken);
                
                var placeTypes = placeTypesData
                    .Select(pt => pt.Map())
                    .ToList()
                    .AsReadOnly();

                logger.LogInformation("{className}.{methodName}: Retrieved {count} place types", nameof(GetPlaceTypesQueryHandler), nameof(Handle), placeTypes.Count);
                return Result<IReadOnlyList<PlaceTypeDto>>.WithData(placeTypes);
            }
            catch (OperationCanceledException oce) when (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(oce, "{className}.{methodName}: Operation was canceled.", nameof(GetPlaceTypesQueryHandler), nameof(Handle));
                return Result<IReadOnlyList<PlaceTypeDto>>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{className}.{methodName}: Unhandled exception {message}", nameof(GetPlaceTypesQueryHandler), nameof(Handle), e.Message);
                return Result<IReadOnlyList<PlaceTypeDto>>.WithError(e.Message);
            }
        }
    }
}