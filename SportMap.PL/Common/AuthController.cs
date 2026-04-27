using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.Services;

namespace SportMap.PL.Common
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(IAuthService authService, IConfiguration configuration) : ControllerBase
    {
        [HttpGet("login/google")]
        public IActionResult Login()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = "api/auth/callback/google"
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }
        [HttpGet("callback/google")]
        public async Task<IActionResult> Callback(CancellationToken cancellationToken)
        {
            var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);

            if (!result.Succeeded)
                return Unauthorized();
            
            var userGoogleInfo = new GoogleUserInfoDto
            {
                GoogleId   = result.Principal!.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty,
                Email      = result.Principal!.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                GivenName  = result.Principal!.FindFirst(ClaimTypes.GivenName)?.Value,
                FamilyName = result.Principal!.FindFirst(ClaimTypes.Surname)?.Value
            };

            var authResult = await authService.ProcessGoogleLoginAsync(userGoogleInfo, cancellationToken);
            Response.Cookies.Append("access_token", authResult.AccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = configuration.GetValue<bool>("Cookie:Secure"),
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(15)
            });

            return Redirect(configuration["Frontend:Url"] ?? "http://localhost:3000");
        }
    }
}