using DomainLayer.Entities.Enums;
using SportMap.AL.Abstractions;

namespace SportMap.AL.DTOs
{
    public class PostDTO : IDTO
    {
        public PostDTO() { }

        public PostDTO(Guid id, string title, string content, StatusType status, Guid placeId, DateTime createdAt)
        {
            Id = id;
            Title = title;
            Content = content;
            Status = status;
            PlaceId = placeId;
            CreatedAt = createdAt;
        }

        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public StatusType Status { get; set; }
        public Guid PlaceId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
