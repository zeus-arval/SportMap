using Microsoft.Extensions.DependencyInjection;
using SportMap.AL.Abstractions.Services;
using SportMap.AL.UseCases.Feeds;
using SportMap.AL.UseCases.Images;
using SportMap.AL.UseCases.Users;
using SportMap.AL.UseCases.Places;
using SportMap.AL.UseCases.PlaceTypes;
using SportMap.DAL.Cache;
using SportMap.AL.Common;

namespace SportMap.Al.Extensions
{
    public static class DIInitializationExtensions
    {
        public static void AddALServices(this IServiceCollection serviceCollection)
        {
            // TODO Register Services
            serviceCollection.AddScoped<IAuthService, AuthService>();
            serviceCollection.AddScoped<IJwtService, JwtService>();
            serviceCollection.AddSingleton<ICacheService, RedisCacheService>();

            // Posts
            serviceCollection.AddTransient<GetPostQueryHandler>();
            serviceCollection.AddTransient<CreatePostCommandHandler>();
            serviceCollection.AddTransient<GetLatestUpdateQueryHandler>();

            // Images
            serviceCollection.AddTransient<GetImageQueryHandler>();
            serviceCollection.AddTransient<UploadProfilePictureCommandHandler>();
            serviceCollection.AddTransient<RemoveProfilePictureCommandHandler>();
            serviceCollection.AddTransient<GetOwnProfilePictureQueryHandler>();
            serviceCollection.AddTransient<GetProfilePictureByUsernameQueryHandler>();

            // Users
            serviceCollection.AddTransient<GetCurrentUserInfoQueryHandler>();
            
            // Places
            serviceCollection.AddTransient<GetPlaceQueryHandler>();
            serviceCollection.AddTransient<SearchPlacesQueryHandler>();
            serviceCollection.AddTransient<CreatePlaceCommandHandler>();

            // PlaceTypes
            serviceCollection.AddTransient<GetPlaceTypesQueryHandler>();
        }
    }
}
