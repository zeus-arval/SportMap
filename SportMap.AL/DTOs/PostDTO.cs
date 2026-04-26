using DomainLayer.Entities.Enums;
using SportMap.AL.Abstractions;

namespace SportMap.AL.DTOs
{
    public class PostDTO : IDTO
    {
        public PostDTO() { }

        public PostDTO(Guid id, string title, string content, StatusType status, Guid? authorId = null, Guid? placeId = null)
        {
            Id = id;
            Title = title;
            Content = content;
            Status = status;
            AuthorId = authorId;
            PlaceId = placeId;
        }

        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public StatusType Status { get; set; }
        public Guid? AuthorId { get; set; }
        public Guid? PlaceId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
