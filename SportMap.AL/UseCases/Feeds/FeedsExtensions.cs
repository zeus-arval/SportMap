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
                    Content = data.Content,
                    Id = data.Id,
                    Title = data.Title,
                    Status = data.Status,
                    PlaceId = data.PlaceId,
                    CreatedAt = data.CreatedAt
                };
            }
        }

        extension(PostDTO dto)
        {
            public Post Map()
            {
                return new Post
                {
                    Id = dto.Id,
                    Content = dto.Content,
                    Status = dto.Status,
                    Title = dto.Title,
                    PlaceId = dto.PlaceId,
                    CreatedAt = dto.CreatedAt
                };
            }
        }
    }
}
