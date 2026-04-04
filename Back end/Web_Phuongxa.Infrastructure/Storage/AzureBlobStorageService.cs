using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Application.Interfaces;

namespace Web_Phuongxa.Infrastructure.Storage
{
    public class AzureBlobStorageService : IFileStorageService
    {
        private readonly string _connectionString;
        private readonly string _containerName;

        public AzureBlobStorageService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("AzureBlobStorage") ?? string.Empty;
            _containerName = configuration["BlobStorage:ContainerName"] ?? string.Empty;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string subFolder = "")
        {
            if (file == null || file.Length == 0 || string.IsNullOrWhiteSpace(_connectionString) || string.IsNullOrWhiteSpace(_containerName))
            {
                return string.Empty;
            }

            var containerClient = await GetContainerClientAsync();
            if (containerClient == null)
            {
                return string.Empty;
            }

            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var blobName = string.IsNullOrWhiteSpace(subFolder) ? uniqueFileName : $"{subFolder.Trim().Trim('/')}/{uniqueFileName}";
            var blobClient = containerClient.GetBlobClient(blobName);

            var uploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType
                }
            };

            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, uploadOptions);

            return blobClient.Uri.ToString();
        }

        public async Task<Stream?> DownloadImageAsync(string blobReference)
        {
            var blobClient = await GetBlobClientAsync(blobReference);
            if (blobClient == null || !await blobClient.ExistsAsync())
            {
                return null;
            }

            var download = await blobClient.DownloadStreamingAsync();
            return download.Value.Content;
        }

        public async Task<bool> ExistsAsync(string blobReference)
        {
            var blobClient = await GetBlobClientAsync(blobReference);
            if (blobClient == null)
            {
                return false;
            }

            return await blobClient.ExistsAsync();
        }

        private async Task<BlobContainerClient?> GetContainerClientAsync()
        {
            if (string.IsNullOrWhiteSpace(_connectionString) || string.IsNullOrWhiteSpace(_containerName))
            {
                return null;
            }

            var blobServiceClient = new BlobServiceClient(_connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            return containerClient;
        }

        private async Task<BlobClient?> GetBlobClientAsync(string blobReference)
        {
            var containerClient = await GetContainerClientAsync();
            if (containerClient == null)
            {
                return null;
            }

            var blobName = ResolveBlobName(blobReference);
            return string.IsNullOrWhiteSpace(blobName) ? null : containerClient.GetBlobClient(blobName);
        }

        private string ResolveBlobName(string blobReference)
        {
            if (string.IsNullOrWhiteSpace(blobReference))
            {
                return string.Empty;
            }

            if (Uri.TryCreate(blobReference, UriKind.Absolute, out var absoluteUri))
            {
                var segments = absoluteUri.AbsolutePath.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
                if (segments.Length == 0)
                {
                    return string.Empty;
                }

                if (segments[0].Equals(_containerName, StringComparison.OrdinalIgnoreCase) && segments.Length > 1)
                {
                    return string.Join('/', segments.Skip(1));
                }

                return string.Join('/', segments);
            }

            var relative = blobReference.TrimStart('/');
            if (relative.StartsWith(_containerName + "/", StringComparison.OrdinalIgnoreCase))
            {
                relative = relative.Substring(_containerName.Length + 1);
            }

            return relative;
        }
    }
}