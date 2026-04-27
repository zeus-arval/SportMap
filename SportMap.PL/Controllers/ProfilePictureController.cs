using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.Constants;
using SportMap.AL.UseCases.Images;

namespace SportMap.PL.Controllers
{
    [Route("api/profile-picture")]
    [ApiController]
    [Authorize]
    public class ProfilePictureController(
        UploadProfilePictureCommandHandler uploadHandler,
        RemoveProfilePictureCommandHandler removeHandler,
        GetOwnProfilePictureQueryHandler getHandler,
        GetProfilePictureByUsernameQueryHandler getUsernameHandler,
        ILogger<ProfilePictureController> logger) : ControllerBase
    {
        [HttpPost]
        [RequestSizeLimit(9_437_184)]
        [RequestFormLimits(MultipartBodyLengthLimit = 9_437_184)]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, CancellationToken cancellationToken)
        {
            if (file is null)
                return BadRequest("No file provided.");

            var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (subClaim is null || !Guid.TryParse(subClaim, out var userId))
            {
                logger.LogWarning("{class}.{method}: Missing or invalid sub claim",
                    nameof(ProfilePictureController), nameof(Upload));
                return Unauthorized();
            }

            await using var stream = file.OpenReadStream();
            var command = new UploadProfilePictureCommand(
                stream,
                file.FileName,
                file.Length,
                userId);

            var result = await uploadHandler.Handle(command, cancellationToken);

            if (!result.HasError)
                return Ok(new { imageId = result.Data!.Id });

            if (result.ErrorMessage.Contains("unsupported type"))
                return BadRequest(result.ErrorMessage);
            if (result.ErrorMessage.Contains("exceeds the maximum"))
                return BadRequest(result.ErrorMessage);
            if (result.ErrorMessage == ResultConstants.StorageUnavailable)
                return StatusCode(503);

            return StatusCode(500);
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetByUsername(string username, CancellationToken cancellationToken)
        {
            AL.Abstractions.UseCases.Result<AL.Abstractions.Dtos.UserProfilePictureDto> result;
            try
            {
                result = await getUsernameHandler.Handle(
                    new GetProfilePictureByUsernameQuery(username), cancellationToken);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception: {msg}",
                    nameof(ProfilePictureController), nameof(GetByUsername), e.Message);
                return StatusCode(500);
            }

            if (result.HasError)
                return NotFound();

            return Ok(new { profilePictureId = result.Data!.ProfilePictureId?.ToString() });
        }

        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (subClaim is null || !Guid.TryParse(subClaim, out var userId))
            {
                logger.LogWarning("{class}.{method}: Missing or invalid sub claim",
                    nameof(ProfilePictureController), nameof(Get));
                return Unauthorized();
            }

            AL.Abstractions.UseCases.Result<AL.Abstractions.Dtos.UploadImageResponseDto> result;
            try
            {
                result = await getHandler.Handle(new GetOwnProfilePictureQuery(userId), cancellationToken);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception: {msg}",
                    nameof(ProfilePictureController), nameof(Get), e.Message);
                return StatusCode(500);
            }

            if (!result.HasError)
                return Ok(new { profilePictureId = result.Data!.Id.ToString() });

            return NotFound();
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(CancellationToken cancellationToken)
        {
            var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (subClaim is null || !Guid.TryParse(subClaim, out var userId))
            {
                logger.LogWarning("{class}.{method}: Missing or invalid sub claim",
                    nameof(ProfilePictureController), nameof(Delete));
                return Unauthorized();
            }

            AL.Abstractions.UseCases.Result<AL.Abstractions.Dtos.UploadImageResponseDto> result;
            try
            {
                result = await removeHandler.Handle(
                    new RemoveProfilePictureCommand(userId), cancellationToken);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception: {msg}",
                    nameof(ProfilePictureController), nameof(Delete), e.Message);
                return StatusCode(500);
            }

            if (!result.HasError)
                return NoContent();

            var expectedNotFound = string.Format(ResultConstants.NotFound, userId);
            if (result.ErrorMessage == expectedNotFound || result.ErrorMessage == ResultConstants.NoPictureSet)
                return NotFound();

            logger.LogError("{class}.{method}: Handler error: {error}",
                nameof(ProfilePictureController), nameof(Delete), result.ErrorMessage);
            return StatusCode(500);
        }
    }
}
