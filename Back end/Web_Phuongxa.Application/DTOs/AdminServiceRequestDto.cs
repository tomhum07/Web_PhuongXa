namespace Web_Phuongxa.Application.DTOs
{
    public class AdminServiceRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ServiceCategoryId { get; set; }
        public string? ServiceCode { get; set; }
        public string? ProcedureFileUrl { get; set; }
        public string? TemplateFileUrl { get; set; }
    }
}
