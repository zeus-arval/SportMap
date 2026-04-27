using Microsoft.AspNetCore.Mvc;
using SportMap.AL.DTOs;
using SportMap.AL.UseCases.PlaceTypes;
using SportMap.PL.Common;

namespace SportMap.PL.Controllers
{
    [Route("api/place-types")]
    [ApiController]
    public class PlaceTypesController(
        GetPlaceTypesQueryHandler getPlaceTypes,
        ILogger<PlaceTypesController> logger) : BaseController<PlaceTypeDto>(logger)
    {
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            AL.Abstractions.UseCases.Result<IReadOnlyList<PlaceTypeDto>>? result;

            try
            {
                var query = new GetPlaceTypesQuery();
                result = await getPlaceTypes.Handle(query, CancellationToken.None);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "{className}.{methodName}: Unhandled exception occurred: {message}", nameof(PlaceTypesController), nameof(Get), e.Message);
                return StatusCode(500);
            }

            if (result.HasError)
            {
                _logger.LogError("{controllerName}.{methodName}: Error occurred while fetching place types: {ErrorMessage}", nameof(PlaceTypesController), nameof(Get), result.ErrorMessage);
                return StatusCode(500);
            }

            var placeTypes = result.Data;

            if (placeTypes!.Count == 0)
            {
                _logger.LogWarning("{controllerName}.{methodName}: No place types found", nameof(PlaceTypesController), nameof(Get));
                return Ok(new List<PlaceTypeDto>());
            }

            return Ok(placeTypes);
        }
    }
}