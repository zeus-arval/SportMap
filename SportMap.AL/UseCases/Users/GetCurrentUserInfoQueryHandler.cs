using SportMap.AL.Abstractions.Dtos;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.Constants;
using SportMap.AL.UseCases.Profile;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Users
{
    public record GetCurrentUserInfoQuery(Guid UserId) : IQuery<UserInfoDto>;

    public class GetCurrentUserInfoQueryHandler(IUnitOfWork unitOfWork)
        : IQueryHandler<GetCurrentUserInfoQuery, UserInfoDto>
    {
        public async Task<Result<UserInfoDto>> Handle(
            GetCurrentUserInfoQuery query,
            CancellationToken cancellationToken)
        {
            var user = await unitOfWork.UserRepository.GetUserById(query.UserId, query.ToParameters(), cancellationToken);

            if (user is null)
                return Result<UserInfoDto>.WithError(
                    string.Format(ResultConstants.NotFound, query.UserId));

            return Result<UserInfoDto>.WithData(
                new UserInfoDto { Id = user.Id, Username = user.UserName, FirstName = user.FirstName });
        }
    }
}
