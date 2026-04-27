using DomainLayer.Entities;

namespace SportMap.DAL.Specifications
{
    public class PlaceTypeSpecification : Specification<PlaceType>
    {
        public PlaceTypeSpecification()
        {
            // No criteria, no includes — retrieves all place types as-is
        }
    }
}
