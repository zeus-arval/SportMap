using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using SportMap.AL.Abstractions;

namespace SportMap.PL.Common
{
    [ApiController]
    public abstract class BaseController<TDTO>(ILogger<BaseController<TDTO>> logger) : ControllerBase
        where TDTO : class, IDTO
    {
        protected readonly ILogger _logger = logger;

        protected Guid? GetUserId()
        {
            var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                        ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(claim, out var id))
                return id;

            return null;
        }
    }
}
