using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SportMap.AL.Abstractions.Services;
using SportMap.DAL.Abstractions;
using SportMap.DAL.Abstractions.Repositories;
using SportMap.DAL.Common;
using SportMap.DAL.DataAccess;
using SportMap.DAL.DataContext;
using SportMap.DAL.Repositories;

namespace SportMap.DAL.Extensions
{
    public static class DIInitializationExtensions
    {
        public static void AddDALServices(this IServiceCollection serviceCollection, IConfiguration configuration)
        {
            serviceCollection.AddDbContextPool<AppDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("sportmapdb")));

            serviceCollection.AddScoped<IUnitOfWork, UnitOfWork>();
            serviceCollection.AddScoped<IUserRepository, UserRepository>();
            serviceCollection.AddScoped<IPostRepository, PostRepository>();
            serviceCollection.AddScoped<IImageRepository, ImageRepository>();
            serviceCollection.AddScoped<IPersonalizationRepository, PersonalizationRepository>();
            serviceCollection.AddScoped<IPrivacyTypeRepository, PrivacyTypeRepository>();
            serviceCollection.AddScoped<IImageStorageService, ImageStorageService>();
            serviceCollection.Configure<ImageStorageOptions>(configuration.GetSection("ImageStorage"));
            serviceCollection.AddScoped<IPlaceRepository, PlaceRepository>();
            serviceCollection.AddScoped<IPlaceTypeRepository, PlaceTypeRepository>();
        }
    }
}
