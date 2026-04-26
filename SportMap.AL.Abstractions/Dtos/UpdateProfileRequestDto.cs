namespace SportMap.AL.Abstractions.Dtos
{
    public record UpdateProfileRequestDto(
        string? FirstName,
        string? LastName,
        string? UserName,
        DateOnly? Birthdate
    );
}
