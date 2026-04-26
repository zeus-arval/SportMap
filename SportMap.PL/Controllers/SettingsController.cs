using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.UseCases.Settings;

namespace SportMap.PL.Controllers
{
    [Route("api/settings")]
    [ApiController]
    [Authorize]
    public class SettingsController(
        GetSettingsQueryHandler getSettings,
        UpdateSettingsCommandHandler updateSettings,
        ILogger<SettingsController> logger) : ControllerBase
    {
        // GET api/settings
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var userId = ExtractUserId();
            if (userId is null)
                return Unauthorized();

            var result = await getSettings.Handle(new GetSettingsQuery(userId.Value), cancellationToken);

            if (result.HasError)
            {
                if (result.ErrorMessage.Contains("not found", StringComparison.OrdinalIgnoreCase))
                    return NotFound();

                logger.LogError("{controller}.{method}: {error}",
                    nameof(SettingsController), nameof(Get), result.ErrorMessage);
                return StatusCode(500);
            }

            return Ok(result.Data);
        }

        // PATCH api/settings
        [HttpPatch]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(
            [FromBody] UpdateSettingsRequest request, CancellationToken cancellationToken)
        {
            var userId = ExtractUserId();
            if (userId is null)
                return Unauthorized();

            var result = await updateSettings.Handle(
                new UpdateSettingsCommand(userId.Value, request.BirthdatePrivacy), cancellationToken);

            if (result.HasError)
            {
                if (result.ErrorMessage.Contains("invalid", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { error = result.ErrorMessage });

                logger.LogError("{controller}.{method}: {error}",
                    nameof(SettingsController), nameof(Update), result.ErrorMessage);
                return StatusCode(500);
            }

            return Ok(result.Data);
        }

        private Guid? ExtractUserId()
        {
            var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                      ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (sub is null || !Guid.TryParse(sub, out var id))
            {
                logger.LogWarning("{controller}: Missing or invalid sub claim", nameof(SettingsController));
                return null;
            }

            return id;
        }
    }

    public record UpdateSettingsRequest(string BirthdatePrivacy);
}
