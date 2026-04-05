namespace Web_Phuongxa.Application.DTOs
{
    public class PublicCommentCreateRequestDto
    {
        public int ArticleId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
