using DomainLayer.Entities;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.DAL.Specifications
{
    public class PlaceSpecification : Specification<Place>
    {
        public PlaceSpecification(GetPlaceParameters p)
        {
            Criteria = place =>
                (p.Status == null || place.Status == p.Status) &&
                (p.Id == null || place.Id == p.Id) &&
                (p.PlaceTypeId == null || place.PlaceTypeId == p.PlaceTypeId);

            Includes.Add(place => place.PlaceType);
        }
    }
}
