namespace Web_Phuongxa.Application.DTOs
{
    public class AdminApplicationRequestDto
    {
        public int ServiceId { get; set; }
        public int ApplicantId { get; set; }
        public string? ApplicationCode { get; set; }
        public string? Status { get; set; }
        public string? AdminNote { get; set; }
    }
}
