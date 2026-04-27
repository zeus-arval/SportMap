using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.AL.UseCases.Profile;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Images
{
    public record GetOwnProfilePictureQuery(Guid UserId) : IQuery<UploadImageResponseDto>;

    public class GetOwnProfilePictureQueryHandler(IUnitOfWork unitOfWork)
        : IQueryHandler<GetOwnProfilePictureQuery, UploadImageResponseDto>
    {
        public async Task<Result<UploadImageResponseDto>> Handle(
            GetOwnProfilePictureQuery query,
            CancellationToken cancellationToken)
        {
            var user = await unitOfWork.UserRepository.GetUserById(query.UserId, query.ToParameters(), cancellationToken);

            if (user is null || user.ProfilePictureId is null)
                return Result<UploadImageResponseDto>.WithError(
                    string.Format(ResultConstants.NotFound, query.UserId));

            return Result<UploadImageResponseDto>.WithData(
                new UploadImageResponseDto { Id = user.ProfilePictureId.Value });
        }
    }
}
