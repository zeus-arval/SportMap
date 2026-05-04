using DomainLayer.Entities;
using SportMap.AL.Abstractions.Dtos;
using System.Security.Cryptography;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.UseCases.Images
{
    internal static class ImagesExtensions
    {
        extension(ImageData data)
        {
            public ImageDto Map()
            {
                return new ImageDto
                {
                    Id = data.Id,
                    Name = data.Name,
                    Status = data.Status
                };
            }
        }

        extension(ImageDto dto)
        {
            public ImageData Map()
            {
                return new ImageData
                {
                    Id = dto.Id,
                    Name = dto.Name,
                    Status = dto.Status
                };
            }
        }

        extension(GetImageQuery query)
        {
            public GetImageParameters ToParameters()
            {
                return new GetImageParameters
                {
                    Id = query.Id,
                };
            }
        }
    }
}
