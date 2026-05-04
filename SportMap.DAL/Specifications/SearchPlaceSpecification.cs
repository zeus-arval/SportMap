using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.DAL.Specifications
{
    public class SearchPlaceSpecification : Specification<Place>
    {
        public SearchPlaceSpecification(SearchPlaceParameters p)
        {
            var term = p.SearchTerm.ToLower();

            Criteria = place =>
                (place.Status == StatusType.Verified && (place.Name.ToLower().Contains(term) ||
                (place.Address != null && place.Address.ToLower().Contains(term)) ||
                place.PlaceType!.Name.ToLower().Contains(term)))
                && place.Status == p.Status;

            Includes.Add(place => place.PlaceType!);
        }
    }
}
