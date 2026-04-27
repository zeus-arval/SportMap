using DomainLayer.Entities;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.Services;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.AL.Common
{
    public class AuthService(
        IUserRepository userRepository,
        IJwtService jwtService
    ) : IAuthService
    {
        public async Task<AuthResponseDto> ProcessGoogleLoginAsync(GoogleUserInfoDto googleUserInfo, CancellationToken cancellationToken = default)
        {
            var user = await userRepository.GetByGoogleIdAsync(googleUserInfo.GoogleId, cancellationToken);
            if (user is null)
            {
                user = new User
                {
                    Id          = Guid.NewGuid(),
                    GoogleId    = googleUserInfo.GoogleId,
                    Email       = googleUserInfo.Email,
                    UserName    = googleUserInfo.Email.Split('@')[0], // for now use mail initials for username
                    FirstName   = googleUserInfo.GivenName ?? string.Empty,
                    LastName    = googleUserInfo.FamilyName,
                    CreatedAt   = DateTime.UtcNow
                };
                await userRepository.AddAsync(user, cancellationToken);
            }
            
            var accessToken = jwtService.GenerateAccessToken(user);
            var refreshToken = jwtService.GenerateRefreshToken();
            var expiresAt = DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeMilliseconds();

            return new AuthResponseDto
            {
                AccessToken     = accessToken,
                RefreshToken    = refreshToken,
                ExpiresAt       = expiresAt,
                User            = new UserDto
                {
                    Id      = user.Id,
                    Email   = user.Email,
                    Name    = $"{user.FirstName} {user.LastName}".Trim()
                }
            };
        }
    }
}