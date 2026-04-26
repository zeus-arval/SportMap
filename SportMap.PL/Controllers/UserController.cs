using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.UseCases.Users;

namespace SportMap.PL.Controllers
{
    [Route("api/user")]
    [ApiController]
    [Authorize]
    public class UserController(
        GetCurrentUserInfoQueryHandler handler,
        ILogger<UserController> logger) : ControllerBase
    {
        [HttpGet("me")]
        public async Task<IActionResult> Me(CancellationToken cancellationToken)
        {
            var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (subClaim is null || !Guid.TryParse(subClaim, out var userId))
            {
                logger.LogWarning("{class}.{method}: Missing or invalid sub claim",
                    nameof(UserController), nameof(Me));
                return Unauthorized();
            }

            AL.Abstractions.UseCases.Result<AL.Abstractions.Dtos.UserInfoDto> result;
            try
            {
                result = await handler.Handle(new GetCurrentUserInfoQuery(userId), cancellationToken);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception: {msg}",
                    nameof(UserController), nameof(Me), e.Message);
                return StatusCode(500);
            }

            if (result.HasError)
                return NotFound();

            return Ok(new { id = result.Data!.Id, username = result.Data!.Username, firstName = result.Data!.FirstName });
        }
    }
}
