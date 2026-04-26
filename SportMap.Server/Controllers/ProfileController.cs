using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.DTOs;
using SportMap.AL.UseCases.Feeds;
using SportMap.AL.UseCases.Profile;

namespace SportMap.PL.Controllers
{
    [Route("api/profile")]
    [ApiController]
    public class ProfileController(
        GetProfileByIdQueryHandler getById,
        GetProfileByUsernameQueryHandler getByUsername,
        UpdateProfileCommandHandler updateProfile,
        GetPostsByUserQueryHandler getPostsByUser,
        ILogger<ProfileController> logger) : ControllerBase
    {
        // GET api/profile/{id}
        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<Results<Ok<UserProfileDto>, NotFound, InternalServerError>> GetById(
            Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await getById.Handle(new GetProfileByIdQuery(id), cancellationToken);

                if (result.HasError)
                {
                    if (result.ErrorMessage.Contains("not found", StringComparison.OrdinalIgnoreCase))
                        return TypedResults.NotFound();

                    logger.LogError("{controller}.{method}: {error}",
                        nameof(ProfileController), nameof(GetById), result.ErrorMessage);
                    return TypedResults.InternalServerError();
                }

                return TypedResults.Ok(result.Data!);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{controller}.{method}: Unhandled exception",
                    nameof(ProfileController), nameof(GetById));
                return TypedResults.InternalServerError();
            }
        }

        // GET api/profile/u/{username}  — shareable profile URL
        [HttpGet("u/{username}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<Results<Ok<UserProfileDto>, NotFound, InternalServerError>> GetByUsername(
            string username, CancellationToken cancellationToken)
        {
            try
            {
                var result = await getByUsername.Handle(new GetProfileByUsernameQuery(username), cancellationToken);

                if (result.HasError)
                {
                    if (result.ErrorMessage.Contains("not found", StringComparison.OrdinalIgnoreCase))
                        return TypedResults.NotFound();

                    logger.LogError("{controller}.{method}: {error}",
                        nameof(ProfileController), nameof(GetByUsername), result.ErrorMessage);
                    return TypedResults.InternalServerError();
                }

                return TypedResults.Ok(result.Data!);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{controller}.{method}: Unhandled exception",
                    nameof(ProfileController), nameof(GetByUsername));
                return TypedResults.InternalServerError();
            }
        }

        // PATCH api/profile — edit own profile (authenticated)
        [HttpPatch]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateProfile(
            [FromBody] UpdateProfileRequestDto request, CancellationToken cancellationToken)
        {
            var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (subClaim is null || !Guid.TryParse(subClaim, out var userId))
            {
                logger.LogWarning("{controller}.{method}: Missing or invalid sub claim",
                    nameof(ProfileController), nameof(UpdateProfile));
                return Unauthorized();
            }

            var command = new UpdateProfileCommand(
                userId,
                request.FirstName,
                request.LastName,
                request.UserName,
                request.Birthdate);

            var result = await updateProfile.Handle(command, cancellationToken);

            if (!result.HasError)
                return Ok(result.Data);

            if (result.ErrorMessage.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound();

            if (result.ErrorMessage.Contains("already taken", StringComparison.OrdinalIgnoreCase))
                return Conflict(new { error = result.ErrorMessage });

            logger.LogError("{controller}.{method}: {error}",
                nameof(ProfileController), nameof(UpdateProfile), result.ErrorMessage);
            return StatusCode(500);
        }

        // GET api/profile/{id}/posts — watch a user's posts
        [HttpGet("{id:guid}/posts")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<Results<Ok<IReadOnlyList<PostDTO>>, NotFound, InternalServerError>> GetPosts(
            Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await getPostsByUser.Handle(new GetPostsByUserQuery(id), cancellationToken);

                if (result.HasError)
                {
                    logger.LogError("{controller}.{method}: {error}",
                        nameof(ProfileController), nameof(GetPosts), result.ErrorMessage);
                    return TypedResults.InternalServerError();
                }

                if (result.Data!.Count == 0)
                    return TypedResults.NotFound();

                return TypedResults.Ok(result.Data!);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{controller}.{method}: Unhandled exception",
                    nameof(ProfileController), nameof(GetPosts));
                return TypedResults.InternalServerError();
            }
        }
    }
}
