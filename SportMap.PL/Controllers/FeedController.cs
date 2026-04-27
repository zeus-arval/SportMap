using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DomainLayer.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.DTOs;
using SportMap.AL.UseCases.Feeds;
using SportMap.PL.Common;
using SportMap.PL.Extensions;

namespace SportMap.PL.Controllers
{
    [Route("api/feed")]
    [ApiController]
    public class FeedController(
        GetPostQueryHandler getPosts,
        CreatePostCommandHandler createPosts,
        GetLatestUpdateQueryHandler getLatestUpdate,
        ILogger<FeedController> logger) : BaseController<PostDto>(logger)
    {
        // GET: api/feed
        [HttpGet]
        public async Task<Results<InternalServerError, NotFound, Ok<IReadOnlyList<PostDto>>>> Get([FromQuery] Guid? placeId)
        {
            AL.Abstractions.UseCases.Result<IReadOnlyList<PostDto>>? result;

            try
            {
                var query = new GetPostQuery(null, StatusType.Verified, placeId);
                result = await getPosts.Handle(query, CancellationToken.None);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "{className}.{methodName}: Unhandled exception occured: {message}", nameof(FeedController), nameof(Get), e.Message);
                return TypedResults.InternalServerError();
            }

            if (result.HasError)
            {
                _logger.LogError("{controllerName}.{methodName}: Error occurred while fetching posts: {ErrorMessage}", nameof(FeedController), nameof(Get), result.ErrorMessage);
                return TypedResults.InternalServerError();
            }

            var posts = result.Data;

            if (posts!.Count == 0)
            {
                _logger.LogWarning("{controllerName}.{methodName}: No posts found", nameof(FeedController), nameof(Get));
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(posts);
        }

        // GET: api/feed/{id}
        [HttpGet("{id:guid}")]
        public async Task<Results<InternalServerError, NotFound, Ok<PostDto>>> Get(Guid id)
        {
            AL.Abstractions.UseCases.Result<IReadOnlyList<PostDto>> result;

            try
            {
                var query = new GetPostQuery(id, StatusType.Verified);
                result = await getPosts.Handle(query, CancellationToken.None);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "{className}.{methodName}: Unhandled exception occured: {message}", nameof(FeedController), nameof(Get), e.Message);
                return TypedResults.InternalServerError();
            }

            if (result.HasError)
            {
                _logger.LogError("{controllerName}.{methodName}: Error occurred while fetching posts: {ErrorMessage}", nameof(FeedController), nameof(Get), result.ErrorMessage);
                return TypedResults.InternalServerError();
            }

            var posts = result.Data;

            if (posts!.Count == 0)
            {
                _logger.LogWarning("{controllerName}.{methodName}: No posts found", nameof(FeedController), nameof(Get));
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(posts[0]);
        }

        // GET: api/feed/latest-update
        [HttpGet("latest-update")]
        public async Task<Results<InternalServerError, Ok<DateTime?>>> GetLatestUpdate([FromQuery] Guid placeId)
        {
            try
            {
                var query = new GetLatestUpdateQuery(placeId);
                var result = await getLatestUpdate.Handle(query, CancellationToken.None);

                if (result.HasError)
                {
                    _logger.LogError("{controllerName}.{methodName}: Error occurred while fetching latest update: {ErrorMessage}", nameof(FeedController), nameof(GetLatestUpdate), result.ErrorMessage);
                    return TypedResults.InternalServerError();
                }

                return TypedResults.Ok(result.Data);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "{className}.{methodName}: Unhandled exception occured: {message}", nameof(FeedController), nameof(GetLatestUpdate), e.Message);
                return TypedResults.InternalServerError();
            }
        }

        // POST: api/feed
        [HttpPost]
        public async Task<Results<InternalServerError, BadRequest, CreatedAtRoute<PostDto>>> CreatePost([FromBody] CreatePostRequest request)
        {
            if (request.Title.IsNullOrEmpty() || request.Content.IsNullOrEmpty())
            {
                _logger.LogWarning("Title, content or placeId is null, empty or default");

                return TypedResults.BadRequest();
            }

            var subClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? authorId = Guid.TryParse(subClaim, out var parsed) ? parsed : null;

            var command = new CreatePostCommand(request.Title, request.Content, authorId);
            var result = await createPosts.Handle(command, CancellationToken.None);

            if (result.HasError)
            {
                return TypedResults.InternalServerError();
            }

            return TypedResults.CreatedAtRoute(result.Data);
        }
    }

    public class CreatePostRequest(string title, string content)
    {
        public string Title { get; init; } = title;
        public string Content { get; init; } = content;
    }
}
