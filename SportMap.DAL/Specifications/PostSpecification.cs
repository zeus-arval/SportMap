using DomainLayer.Entities;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.DAL.Specifications
{
    public class PostSpecification : Specification<Post>
    {
        public PostSpecification(GetPostParameters p)
        {
            Criteria = post =>
                (p.Id == null || post.Id == p.Id) &&
                (p.Status == null || post.Status == p.Status) &&
                (p.AuthorId == null || post.AuthorId == p.AuthorId) &&
                (p.PlaceId == null || post.PlaceId == p.PlaceId);

            Includes.Add(post => post.Author);
            Includes.Add(post => post.Place);
        }
    }
}
