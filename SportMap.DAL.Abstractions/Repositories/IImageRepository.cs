using DomainLayer.Entities;

namespace SportMap.DAL.Abstractions.Repositories
{
    public interface IImageRepository : IRepository<ImageData>
    {
        Task<ImageData?> GetImage(GetImageParameters parameters, CancellationToken ct = default);
        Task SoftDeleteAsync(Guid id, CancellationToken ct = default);
    }

    public readonly record struct GetImageParameters(Guid? Id);
}
