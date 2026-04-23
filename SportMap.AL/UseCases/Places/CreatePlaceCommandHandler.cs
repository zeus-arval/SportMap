using DomainLayer.Entities;
using DomainLayer.Entities.Enums;
using Microsoft.Extensions.Logging;
using SportMap.AL.Abstractions.UseCases;
using SportMap.AL.DTOs;
using SportMap.DAL.Abstractions;

namespace SportMap.AL.UseCases.Places
{
    public class CreatePlaceCommandHandler(IUnitOfWork unitOfWork, ILogger<CreatePlaceCommandHandler> logger) : ICommandHandler<CreatePlaceCommand, PlaceDto>
    {
        public async Task<Result<PlaceDto>> Handle(CreatePlaceCommand command, CancellationToken cancellationToken)
        {
            var placeDto = new PlaceDto(
                Guid.NewGuid(),
                command.Name,
                command.Description,
                command.PlaceTypeId,
                command.Latitude,
                command.Longitude,
                command.Address,
                null,
                command.CreatorId,
                string.Empty,
                DateTime.UtcNow,
                null,
                StatusType.Verified
            );

            try
            {
                var place = placeDto.Map();
                var resultData = await unitOfWork.PlaceRepository.AddAsync(place, cancellationToken);

                return Result<PlaceDto>.WithData(resultData.Map());
            }
            catch (OperationCanceledException oce)
            {
                logger.LogInformation(oce, "{class}.{method}: operation was canceled", nameof(CreatePlaceCommandHandler), nameof(Handle));
                return Result<PlaceDto>.WithError("Operation was canceled.");
            }
            catch (Exception e)
            {
                logger.LogError(e, "{class}.{method}: {message}", nameof(CreatePlaceCommandHandler), nameof(Handle), e.Message);
                return Result<PlaceDto>.WithError(e.Message);
            }
        }
    }

    public record CreatePlaceCommand(
        string Name,
        string Description,
        Guid PlaceTypeId,
        double Latitude,
        double Longitude,
        string? Address,
        Guid CreatorId
    ) : ICommand<PlaceDto>;
}
