using Microsoft.Extensions.Logging;
using SportMap.DAL.Abstractions;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.DataContext;

namespace SportMap.DAL.DataAccess
{
    public class UnitOfWork(
        AppDbContext dbContext,
        IPostRepository postRepo,
        IImageRepository imageRepo,
        IPlaceRepository placeRepo,
        IUserRepository userRepo,
        IPlaceTypeRepository placeTypeRepo,
        IPersonalizationRepository personalizationRepo,
        IPrivacyTypeRepository privacyTypeRepo,
        ILogger<UnitOfWork> logger) : IUnitOfWork
    {
        private bool disposed = false;

        #region Repositories
        public IPostRepository PostRepository => postRepo;
        public IImageRepository ImageRepository => imageRepo;
        public IUserRepository UserRepository => userRepo;
        public IPlaceRepository PlaceRepository => placeRepo;
        public IPlaceTypeRepository PlaceTypeRepository => placeTypeRepo;
        public IPersonalizationRepository PersonalizationRepository => personalizationRepo;
        public IPrivacyTypeRepository PrivacyTypeRepository => privacyTypeRepo;
        #endregion

        public void Save()
        {
            dbContext.SaveChanges();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    dbContext.Dispose();
                }
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
