using SportMap.AL.Abstractions;

namespace SportMap.AL.Abstractions.Dtos
{
    public class UserSettingsDto : IDTO
    {
        public Guid Id { get; set; }
        public string BirthdatePrivacy { get; init; } = "private";
    }
}
