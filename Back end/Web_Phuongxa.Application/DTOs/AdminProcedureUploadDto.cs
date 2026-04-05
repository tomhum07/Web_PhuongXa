using Microsoft.AspNetCore.Http;

namespace Web_Phuongxa.Application.DTOs
{
    public class AdminProcedureUploadDto
    {
        public int? ServiceCategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ServiceCode { get; set; }
        public IFormFile? ProcedureFile { get; set; }
        public IFormFile? TemplateFile { get; set; }
    }
}
