using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DomainLayer.Common;
using DomainLayer.Entities.Enums;

namespace DomainLayer.Entities
{
    public class Post : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
        public StatusType Status { get; set; }

        //[Required]
        //[ForeignKey(nameof(Author))]
        //public Guid AuthorId { get; set; }
        //public User Author { get; set; }

        [Required]
        [ForeignKey(nameof(Place))]
        public Guid PlaceId { get; set; }
        public Place Place { get; set; }

        //[Required]
        //[ForeignKey(nameof(Image))]
        //public Guid ImageId { get; set; }
        //public Image Image { get; set; }
    }
}
