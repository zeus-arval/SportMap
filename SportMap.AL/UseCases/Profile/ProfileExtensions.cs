using DomainLayer.Entities;
using SportMap.AL.Abstractions.Dtos;

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
    }
}
