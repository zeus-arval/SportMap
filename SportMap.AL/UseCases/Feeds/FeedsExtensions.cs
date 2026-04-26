using DomainLayer.Entities;
using SportMap.AL.DTOs;

namespace SportMap.AL.UseCases.Feeds
{
    internal static class FeedsExtensions
    {
        extension(Post data)
        {
            public PostDTO Map()
            {
                return new PostDTO
                {
                    Id        = data.Id,
                    Title     = data.Title,
                    Content   = data.Content,
                    Status    = data.Status,
                    AuthorId  = data.AuthorId,
                    PlaceId   = data.PlaceId,
                    CreatedAt = data.CreatedAt,
                };
            }
        }

        extension(PostDTO dto)
        {
            public Post Map()
            {
                return new Post
                {
                    Id       = dto.Id,
                    Title    = dto.Title,
                    Content  = dto.Content,
                    Status   = dto.Status,
                    AuthorId = dto.AuthorId,
                    PlaceId  = dto.PlaceId ?? Guid.Empty,
                };
            }
        }
    }
}
