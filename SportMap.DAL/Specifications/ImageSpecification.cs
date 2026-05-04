using DomainLayer.Entities;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.DAL.Specifications
{
    public class ImageSpecification : Specification<ImageData>
    {
        public ImageSpecification(GetImageParameters parameters)
        {
            //Includes.Add(image => image.Entity);
        }
    }
}
