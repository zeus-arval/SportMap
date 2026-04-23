using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.DTOs;
using SportMap.AL.UseCases.Places;
using SportMap.PL.Common;
using SportMap.PL.Extensions;

namespace SportMap.PL.Controllers
{
    [Route("api/places")]
    [ApiController]
    public class PlacesController(
        GetPlaceQueryHandler getPlaces,
        SearchPlacesQueryHandler searchPlaces,
        CreatePlaceCommandHandler createPlaces,
        ILogger<PlacesController> logger) : BaseController<PlaceDto>(logger)
    {
        // GET: api/places
        [HttpGet]
        public async Task<Results<InternalServerError, NotFound, Ok<IReadOnlyList<PlaceDto>>>> Get([FromQuery] Guid? placeTypeId, [FromQuery] Guid? placeId)
        {
            AL.Abstractions.UseCases.Result<IReadOnlyList<PlaceDto>>? result;

            try
            {
                var query = new GetPlaceQuery(placeId, StatusType.Verified, placeTypeId);
                result = await getPlaces.Handle(query, CancellationToken.None);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "{className}.{methodName}: Unhandled exception occured: {message}", nameof(PlacesController), nameof(Get), e.Message);
                return TypedResults.InternalServerError();
            }

            if (result.HasError)
            {
                _logger.LogError("{controllerName}.{methodName}: Error occurred while fetching places: {ErrorMessage}", nameof(PlacesController), nameof(Get), result.ErrorMessage);
                return TypedResults.InternalServerError();
            }

            var places = result.Data;

            if (places!.Count == 0)
            {
                _logger.LogWarning("{controllerName}.{methodName}: No places found", nameof(PlacesController), nameof(Get));
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(places);
        }

        // GET: api/places/{id:guid}
        [HttpGet("{id:guid}")]
        public async Task<Results<InternalServerError, NotFound, Ok<PlaceDto>>> Get(Guid id)
        {
            AL.Abstractions.UseCases.Result<IReadOnlyList<PlaceDto>> result;

            try
            {
                var query = new GetPlaceQuery(id, StatusType.Verified, null);
                result = await getPlaces.Handle(query, CancellationToken.None);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "{className}.{methodName}: Unhandled exception occured: {message}", nameof(PlacesController), nameof(Get), e.Message);
                return TypedResults.InternalServerError();
            }

            if (result.HasError)
            {
                _logger.LogError("{controllerName}.{methodName}: Error occurred while fetching place: {ErrorMessage}", nameof(PlacesController), nameof(Get), result.ErrorMessage);
                return TypedResults.InternalServerError();
            }

            var places = result.Data;

            if (places!.Count == 0)
            {
                _logger.LogWarning("{controllerName}.{methodName}: No place found", nameof(PlacesController), nameof(Get));
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(places[0]);
        }

        // GET: api/places/search?q=term
        [HttpGet("search")]
        [ProducesResponseType(typeof(List<PlaceDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<PlaceDto>>> Search([FromQuery] string q)
        {
            try
            {
                var query = new SearchPlacesQuery(q ?? string.Empty);
                var result = await searchPlaces.Handle(query, CancellationToken.None);
                
                if (result.HasError || result.Data == null)
                {
                    return Ok(new List<PlaceDto>());
                }

                return Ok(result.Data.ToList());
            }
            catch (Exception e)
            {
                _logger.LogError(e, "{className}.{methodName}: Unhandled exception occured: {message}", nameof(PlacesController), nameof(Search), e.Message);
                return Ok(new List<PlaceDto>());
            }
        }

        // POST: api/places
        [HttpPost]
        public async Task<Results<InternalServerError, BadRequest, CreatedAtRoute<PlaceDto>>> CreatePlace([FromBody] CreatePlaceRequest request)
        {
            if (request.Name.IsNullOrEmpty() || request.Description.IsNullOrEmpty())
            {
                _logger.LogWarning("Name or description is null or empty");
                return TypedResults.BadRequest();
            }

            var command = new CreatePlaceCommand(
                request.Name,
                request.Description,
                request.PlaceTypeId,
                request.Latitude,
                request.Longitude,
                request.Address,
                request.CreatorId
            );

            var result = await createPlaces.Handle(command, CancellationToken.None);

            if (result.HasError)
            {
                return TypedResults.InternalServerError();
            }

            return TypedResults.CreatedAtRoute(result.Data);
        }
    }
}
