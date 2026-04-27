using DomainLayer.Entities;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.UseCases.Images;
using SportMap.AL.UseCases.Settings;
using SportMap.AL.UseCases.Users;
using SportMap.DAL.Abstractions.Repositories;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace SportMap.AL.UseCases.Profile
{
    internal static class ProfileExtensions
    {
        private const string PublicPrivacy = "public";

        extension(User user)
        {
            public UserProfileDto MapToProfileDto()
            {
                var isBirthdatePublic = user.Personalization?.BirthdatePrivacyType?.Name
                    .Equals(PublicPrivacy, StringComparison.OrdinalIgnoreCase) == true;

                return new UserProfileDto
                {
                    Id        = user.Id,
                    UserName  = user.UserName,
                    Email     = user.Email,
                    FirstName = user.FirstName,
                    LastName  = user.LastName,
                    RoleName  = user.UserRole?.Name,
                    Birthdate = isBirthdatePublic ? user.Birthdate : null,
                };
            }
        }

        extension(GetOwnProfilePictureQuery query)
        {
            public GetUsersParameters ToParameters()
            {
                return new GetUsersParameters
                {
                    Id = query.UserId,
                };
            }
        }

        extension(RemoveProfilePictureCommand command)
        {
            public GetUsersParameters ToParameters()
            {
                return new GetUsersParameters
                {
                    Id = command.UserId,
                };
            }
        }

        extension(GetSettingsQuery query)
        {
            public GetUsersParameters ToParameters()
            {
                return new GetUsersParameters
                {
                    Id = query.UserId,
                };
            }
        }

        extension(UpdateSettingsCommand command)
        {
            public GetUsersParameters ToParameters()
            {
                return new GetUsersParameters
                {
                    Id = command.UserId,
                    BirthdatePrivacy = command.BirthdatePrivacy
                };
            }
        }

        extension(GetCurrentUserInfoQuery query)
        {
            public GetUsersParameters ToParameters()
            {
                return new GetUsersParameters
                {
                    Id = query.UserId
                };
            }
        }
    }
}
