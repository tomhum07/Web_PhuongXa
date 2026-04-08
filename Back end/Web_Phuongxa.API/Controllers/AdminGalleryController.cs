using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Application.Interfaces;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/admin/gallery")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class AdminGalleryController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;
        private readonly IFileStorageService _fileStorageService;

        public AdminGalleryController(PhuongXaDbContext context, IFileStorageService fileStorageService)
        {
            _context = context;
            _fileStorageService = fileStorageService;
        }

        private string BuildImageApiUrl(int imageId) => $"{Request.Scheme}://{Request.Host}/api/Gallery/{imageId}/image";

        private static string NormalizeSectionFolder(string section)
        {
            var normalized = section.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            var noAccent = sb.ToString().Normalize(NormalizationForm.FormC);
            noAccent = Regex.Replace(noAccent, @"[^a-z0-9\s-]", string.Empty);
            return Regex.Replace(noAccent, @"\s+", "-").Trim('-');
        }

        private async Task<bool> ImageExistsAsync(string imageReference)
        {
            return await _fileStorageService.ExistsAsync(imageReference);
        }

        [HttpGet]
        public async Task<IActionResult> GetImages([FromQuery] string? section)
        {
            var query = _context.GalleryImages.AsQueryable();

            if (!string.IsNullOrWhiteSpace(section))
            {
                var normalizedSection = section.Trim().ToLower();
                query = query.Where(img => img.Section.ToLower() == normalizedSection);
            }

            var images = await query
                .OrderByDescending(img => img.CreatedAt)
                .Include(img => img.Uploader)
                .ToListAsync();

            var result = new List<object>();
            foreach (var img in images)
            {
                result.Add(new
                {
                    img.ImageId,
                    img.Section,
                    img.Title,
                    ImageUrl = BuildImageApiUrl(img.ImageId),
                    BlobUrl = img.ImageUrl,
                    HasFile = await ImageExistsAsync(img.ImageUrl),
                    img.UploaderId,
                    UploaderName = img.Uploader != null ? img.Uploader.FullName : null,
                    img.IsVisible,
                    img.CreatedAt
                });
            }

            return Ok(result);
        }

        [HttpGet("missing-files")]
        public async Task<IActionResult> GetMissingFiles()
        {
            var images = await _context.GalleryImages
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new { x.ImageId, x.Section, x.Title, x.ImageUrl, x.IsVisible })
                .ToListAsync();

            var missing = new List<object>();
            foreach (var x in images)
            {
                if (!await ImageExistsAsync(x.ImageUrl))
                {
                    missing.Add(new
                    {
                        x.ImageId,
                        x.Section,
                        x.Title,
                        BlobUrl = x.ImageUrl,
                        ImageUrl = BuildImageApiUrl(x.ImageId),
                        x.IsVisible
                    });
                }
            }

            return Ok(missing);
        }

        [HttpPost("hide-missing-files")]
        public async Task<IActionResult> HideMissingFiles()
        {
            var images = await _context.GalleryImages.Where(x => x.IsVisible).ToListAsync();
            var toHide = new List<Web_Phuongxa.Domain.Entities.GalleryImage>();

            foreach (var image in images)
            {
                if (!await ImageExistsAsync(image.ImageUrl))
                {
                    image.IsVisible = false;
                    toHide.Add(image);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã ẩn các bản ghi không còn file trên server.", Count = toHide.Count });
        }

        [HttpPatch("{imageId:int}/hide")]
        public async Task<IActionResult> HideImage(int imageId)
        {
            var image = await _context.GalleryImages.FirstOrDefaultAsync(x => x.ImageId == imageId);
            if (image == null)
            {
                return NotFound(new { Message = "Không tìm thấy ảnh." });
            }

            if (!image.IsVisible)
            {
                return Ok(new { Message = "Ảnh đã ở trạng thái ẩn.", image.ImageId, image.IsVisible });
            }

            image.IsVisible = false;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Ẩn ảnh thành công.", image.ImageId, image.IsVisible });
        }

        [HttpDelete("{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int imageId, [FromQuery] bool deleteFile = true)
        {
            var image = await _context.GalleryImages.FirstOrDefaultAsync(x => x.ImageId == imageId);
            if (image == null)
            {
                return NotFound(new { Message = "Không tìm thấy ảnh." });
            }

            var fileExisted = false;
            var fileDeleted = false;

            if (deleteFile && !string.IsNullOrWhiteSpace(image.ImageUrl))
            {
                fileExisted = await ImageExistsAsync(image.ImageUrl);
                if (fileExisted)
                {
                    fileDeleted = await _fileStorageService.DeleteAsync(image.ImageUrl);
                }
            }

            _context.GalleryImages.Remove(image);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Xóa ảnh thành công.",
                imageId,
                deleteFile,
                fileExisted,
                fileDeleted
            });
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] UploadImageDto request)
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { Message = "Vui lòng chọn một tệp ảnh." });
            }

            if (string.IsNullOrWhiteSpace(request.Section))
            {
                return BadRequest(new { Message = "Section không được để trống." });
            }

            var sectionFolder = NormalizeSectionFolder(request.Section);
            var blobUrl = await _fileStorageService.UploadImageAsync(request.File, sectionFolder);

            if (string.IsNullOrWhiteSpace(blobUrl))
            {
                return StatusCode(500, new { Message = "Không thể tải ảnh lên Azure Blob Storage." });
            }

            var galleryImage = new Web_Phuongxa.Domain.Entities.GalleryImage
            {
                Section = request.Section.Trim(),
                Title = request.Title ?? string.Empty,
                ImageUrl = blobUrl,
                UploaderId = request.UploaderId,
                IsVisible = true,
                CreatedAt = DateTime.UtcNow.AddHours(7)
            };

            _context.GalleryImages.Add(galleryImage);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Tải ảnh lên thành công!",
                imageUrl = BuildImageApiUrl(galleryImage.ImageId),
                blobUrl = galleryImage.ImageUrl,
                Image = new
                {
                    galleryImage.ImageId,
                    galleryImage.Section,
                    galleryImage.Title,
                    ImageUrl = BuildImageApiUrl(galleryImage.ImageId),
                    BlobUrl = galleryImage.ImageUrl,
                    HasFile = true,
                    galleryImage.UploaderId,
                    galleryImage.IsVisible,
                    galleryImage.CreatedAt
                }
            });
        }
    }
}
