using DomainLayer.Entities;
using DomainLayer.Entities.Enums;

namespace SportMap.DAL.Abstractions.Repositories
{
    public interface IPostRepository : IRepository<Post>
    {
        Task<IReadOnlyList<Post>> GetPosts(GetPostParameters parameters, CancellationToken ct = default);
    }

    public readonly record struct GetPostParameters(Guid? Id, Guid? AuthorId, StatusType? Status, Guid? PlaceId = null);
}
