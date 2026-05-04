using DomainLayer.Entities;
using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataContext;
using SportMap.DAL.Specifications;

namespace SportMap.DAL.Repositories
{
    public class PostRepository(AppDbContext context, ILogger<PostRepository> logger) : BaseRepository<Post>(context, logger, context.Posts), IPostRepository
    {
        public async Task<IReadOnlyList<Post>> GetPosts(GetPostParameters parameters, CancellationToken ct = default)
        {
            var specification = new PostSpecification(parameters);

            return await FindAsync(specification, ct);
        }
    }
}
