using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Web_Phuongxa.Domain.Entities
{
    [Table("GalleryImages")]
    public class GalleryImage
    {
        [Key]
        [Column("ImageId")]
        public int ImageId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Section { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Title { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public int UploaderId { get; set; }

        public bool IsVisible { get; set; }

        public DateTime? CreatedAt { get; set; }

        [ForeignKey("UploaderId")]
        public virtual User? Uploader { get; set; }
    }
}