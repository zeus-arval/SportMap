using DomainLayer.Entities;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Feeds
{
    internal static class FeedsExtensions
    {
        extension(Post data)
        {
            public DTOs.PostDto Map()
            {
                return new DTOs.PostDto
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

        extension(DTOs.PostDto dto)
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

        extension(GetPostQuery query)
        {
            public GetPostParameters ToParameters()
            {
                return new GetPostParameters
                {
                    Id = query.Id,
                    Status = query.Status,
                };
            }
        }

        extension(GetPostsByUserQuery query)
        {
            public GetPostParameters ToParameters()
            {
                return new GetPostParameters
                {
                    AuthorId = query.AuthorId,
                    Status = DomainLayer.Entities.Enums.StatusType.Verified,
                };
            }
        }

        extension(GetLatestUpdateQuery query)
        {
            public GetPostParameters ToParameters()
            {
                return new GetPostParameters
                {
                    PlaceId = query.PlaceId,
                    Status = DomainLayer.Entities.Enums.StatusType.Verified,
                };
            }
        }
    }
}
