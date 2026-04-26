using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.Constants;
using SportMap.AL.UseCases.Images;

namespace SportMap.PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ImagesController(
        GetImageQueryHandler getImage,
        ILogger<ImagesController> logger) : ControllerBase
    {
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
        {
            var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (subClaim is null || !Guid.TryParse(subClaim, out _))
            {
                logger.LogWarning("{class}.{method}: Missing or invalid sub claim for image {id}",
                    nameof(ImagesController), nameof(Get), id);
                return Unauthorized();
            }

            AL.Abstractions.UseCases.Result<ImageServeResult> result;
            try
            {
                result = await getImage.Handle(new GetImageQuery(id), cancellationToken);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception for image {id}: {msg}",
                    nameof(ImagesController), nameof(Get), id, e.Message);
                return StatusCode(500);
            }

            if (!result.HasError)
                return File(new MemoryStream(result.Data!.Content), result.Data.ContentType);

            var expectedNotFound = string.Format(ResultConstants.NotFound, id);
            if (result.ErrorMessage == expectedNotFound)
                return NotFound();
            if (result.ErrorMessage == ResultConstants.StorageUnavailable)
                return StatusCode(503);

            logger.LogError("{class}.{method}: Handler error for image {id}: {error}",
                nameof(ImagesController), nameof(Get), id, result.ErrorMessage);
            return StatusCode(500);
        }
    }
}
