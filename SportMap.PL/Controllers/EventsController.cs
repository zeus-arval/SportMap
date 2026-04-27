using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.DTOs;
using SportMap.AL.UseCases.Events;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.PL.Common;
using SportMap.PL.Requests;

namespace SportMap.PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController(
        CreateEventCommandHandler createEvent,
        GetEventByIdQueryHandler getEventById,
        GetUpcomingEventsQueryHandler getUpcomingEvents,
        GetEventsByPlaceQueryHandler getEventsByPlace,
        GetFilteredEventsQueryHandler getFilteredEvents,
        JoinEventCommandHandler joinEvent,
        LeaveEventCommandHandler leaveEvent,
        ILogger<EventsController> logger) : BaseController<EventDto>(logger)
    {
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto, CancellationToken ct)
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized();

            var command = new CreateEventCommand(userId.Value, dto.PlaceId, dto.Title, dto.Description, dto.StartTime, dto.Capacity);
            var result = await createEvent.Handle(command, ct);

            if (result.HasError)
                return BadRequest(result.ErrorMessage);

            return CreatedAtAction(nameof(GetEventById), new { eventId = result.Data!.Id }, result.Data);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUpcoming(
            [FromQuery] EventFilterRequest filters,
            CancellationToken ct = default)
        {
            var pageSize = Math.Clamp(filters.PageSize, 1, 100);
            var hasFilters = filters.Lat.HasValue || filters.Lng.HasValue || filters.DateFrom.HasValue || filters.DateTo.HasValue;

            if (hasFilters)
            {
                var filter = new EventFilter(
                    filters.Lat, filters.Lng, filters.RadiusKm,
                    filters.DateFrom, filters.DateTo,
                    filters.Page, pageSize);
                var filterQuery = new GetFilteredEventsQuery(filter);
                var filterResult = await getFilteredEvents.Handle(filterQuery, ct);

                if (filterResult.HasError)
                    return StatusCode(500);

                return Ok(filterResult.Data);
            }

            var query = new GetUpcomingEventsQuery(filters.Page, pageSize);
            var result = await getUpcomingEvents.Handle(query, ct);

            if (result.HasError)
                return StatusCode(500);

            return Ok(result.Data);
        }

        [HttpGet("/api/places/{placeId:guid}/events")]
        public async Task<IActionResult> GetUpcomingByPlace(Guid placeId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        {
            pageSize = Math.Clamp(pageSize, 1, 100);
            var query = new GetEventsByPlaceQuery(placeId, page, pageSize);
            var result = await getEventsByPlace.Handle(query, ct);

            if (result.HasError)
                return StatusCode(500);

            return Ok(result.Data);
        }

        [HttpGet("{eventId:guid}")]
        public async Task<IActionResult> GetEventById(Guid eventId, CancellationToken ct)
        {
            var query = new GetEventByIdQuery(eventId);
            var result = await getEventById.Handle(query, ct);

            if (result.HasError)
                return NotFound(result.ErrorMessage);

            return Ok(result.Data);
        }

        [Authorize]
        [HttpPost("{eventId:guid}/join")]
        public async Task<IActionResult> JoinEvent(Guid eventId, CancellationToken ct)
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized();

            var command = new JoinEventCommand(eventId, userId.Value);
            var result = await joinEvent.Handle(command, ct);

            if (result.HasError)
                return BadRequest(result.ErrorMessage);

            return Ok();
        }

        [Authorize]
        [HttpPost("{eventId:guid}/leave")]
        public async Task<IActionResult> LeaveEvent(Guid eventId, CancellationToken ct)
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized();

            var command = new LeaveEventCommand(eventId, userId.Value);
            var result = await leaveEvent.Handle(command, ct);

            if (result.HasError)
                return BadRequest(result.ErrorMessage);

            return Ok();
        }
    }
}
