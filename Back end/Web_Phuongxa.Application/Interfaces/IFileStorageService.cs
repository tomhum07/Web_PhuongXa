using Microsoft.AspNetCore.Http;
using System.IO;

namespace Web_Phuongxa.Application.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> UploadImageAsync(IFormFile file, string subFolder = "");
        Task<Stream?> DownloadImageAsync(string blobReference);
        Task<bool> ExistsAsync(string blobReference);
        Task<bool> DeleteAsync(string blobReference);
    }
}
