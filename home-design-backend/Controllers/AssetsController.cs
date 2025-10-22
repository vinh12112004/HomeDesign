using home_design_backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace home_design_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssetsController : ControllerBase
    {
        private readonly IBlobStorageService _blobService;

        public AssetsController(IBlobStorageService blobService)
        {
            _blobService = blobService;
        }

        [HttpPost("upload/texture")]
        public async Task<IActionResult> UploadTexture( IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            var path = await _blobService.UploadFileAsync(file, "textures");
            var url = await _blobService.GetFileUrlAsync(path);

            return Ok(new { path, url });
        }

        [HttpPost("upload/furniture")]
        public async Task<IActionResult> UploadFurniture(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            var path = await _blobService.UploadFileAsync(file, "furnitures");
            var url = await _blobService.GetFileUrlAsync(path);

            return Ok(new { path, url });
        }
        [HttpGet("url")]
        public async Task<IActionResult> GetPresignedUrl([FromQuery] string folder, [FromQuery] string filename)
        {
            string url = await _blobService.GetPresignedUrlAsync(folder, filename);
            return Ok(url);
        }

        [HttpGet("textures")]
        public async Task<IActionResult> ListTextures()
        {
            var list = await _blobService.ListFilesAsync("textures");
            return Ok(list);
        }
        [HttpGet("furnitures")]
        public async Task<IActionResult> ListFurnitures()
        {
            var list = await _blobService.ListFilesAsync("furnitures");
            return Ok(list);
        }
    }
}
