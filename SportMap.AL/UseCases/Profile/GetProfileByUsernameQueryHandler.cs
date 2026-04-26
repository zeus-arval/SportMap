using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Profile
{
    public record GetProfileByUsernameQuery(string Username) : IQuery<UserProfileDto>;

    public class GetProfileByUsernameQueryHandler(
        IUnitOfWork unitOfWork,
        ILogger<GetProfileByUsernameQueryHandler> logger
    ) : IQueryHandler<GetProfileByUsernameQuery, UserProfileDto>
    {
        public async Task<Result<UserProfileDto>> Handle(GetProfileByUsernameQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var user = await unitOfWork.UserRepository.GetByUsernameWithProfileAsync(query.Username, cancellationToken);

                if (user is null)
                    return Result<UserProfileDto>.WithError(string.Format(ResultConstants.NotFound, query.Username));

                return Result<UserProfileDto>.WithData(user.MapToProfileDto());
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled",
                    nameof(GetProfileByUsernameQueryHandler), nameof(Handle));
                return Result<UserProfileDto>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception",
                    nameof(GetProfileByUsernameQueryHandler), nameof(Handle));
                return Result<UserProfileDto>.WithError(ResultConstants.InternalError);
            }
        }
    }
}
