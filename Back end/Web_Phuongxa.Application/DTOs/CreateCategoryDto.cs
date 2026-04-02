namespace Web_Phuongxa.Application.DTOs
{
    public class CreateCategoryDto
    {
        public int? ParentId { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}