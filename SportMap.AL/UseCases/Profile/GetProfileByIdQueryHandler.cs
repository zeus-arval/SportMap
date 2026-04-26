using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Profile
{
    public record GetProfileByIdQuery(Guid UserId) : IQuery<UserProfileDto>;

    public class GetProfileByIdQueryHandler(
        IUnitOfWork unitOfWork,
        ILogger<GetProfileByIdQueryHandler> logger
    ) : IQueryHandler<GetProfileByIdQuery, UserProfileDto>
    {
        public async Task<Result<UserProfileDto>> Handle(GetProfileByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var user = await unitOfWork.UserRepository.GetByIdWithProfileAsync(query.UserId, cancellationToken);

                if (user is null)
                    return Result<UserProfileDto>.WithError(string.Format(ResultConstants.NotFound, query.UserId));

                return Result<UserProfileDto>.WithData(user.MapToProfileDto());
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled",
                    nameof(GetProfileByIdQueryHandler), nameof(Handle));
                return Result<UserProfileDto>.WithError(ResultConstants.OperationCanceled);
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: Unhandled exception",
                    nameof(GetProfileByIdQueryHandler), nameof(Handle));
                return Result<UserProfileDto>.WithError(ResultConstants.InternalError);
            }
        }
    }
}
