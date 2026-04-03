namespace Web_Phuongxa.Application.DTOs
{
    public class CommentRequestDto
    {
        public int ArticleId { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}