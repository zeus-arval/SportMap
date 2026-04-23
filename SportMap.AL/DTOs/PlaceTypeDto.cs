using SportMap.AL.Abstractions;

namespace SportMap.AL.DTOs
{
    public class PlaceTypeDto : IDTO
    {
        public PlaceTypeDto() { }

        public Guid Id { get; set; }
        public string Name { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
    }
}