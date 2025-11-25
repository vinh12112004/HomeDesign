using home_design_backend.DTOs;
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
        public async Task<IActionResult> UploadTexture(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            var path = await _blobService.UploadFileAsync(file, "textures");
            var url = await _blobService.GetFileUrlAsync(path);

            return Ok(new { path, url });
        }

        [HttpPost("upload/furniture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadFurniture([FromForm] FurnitureUploadDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NameModel))
                return BadRequest("nameModel is required");

            if (dto.ObjFile == null)
                return BadRequest("obj are required");

            try
            {
                var objPath = await _blobService.UploadFileAsync(dto.ObjFile, $"furnitures/{dto.NameModel}");
                var objUrl = await _blobService.GetFileUrlAsync(objPath);

                string? textureUrl = null;
                string? mtlUrl = null;

                if (dto.MtlFile != null)
                {
                    var mtlPath = await _blobService.UploadFileAsync(dto.MtlFile, $"furnitures/{dto.NameModel}");
                    mtlUrl = await _blobService.GetFileUrlAsync(mtlPath);
                }

                if (dto.TextureFile != null)
                {
                    var texturePath = await _blobService.UploadFileAsync(dto.TextureFile, $"furnitures/{dto.NameModel}");
                    textureUrl = await _blobService.GetFileUrlAsync(texturePath);
                }  

                return Ok(new
                {
                    objPath = objUrl,
                    mtlPath = mtlUrl != null ? mtlUrl : null,
                    texturePath = textureUrl != null ? textureUrl : null,
                    nameModel = dto.NameModel
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Upload failed: {ex.Message}");
            }
        }

        [HttpPost("upload/opening")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadOpening([FromForm] FurnitureUploadDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NameModel))
                return BadRequest("nameModel is required");

            if (dto.ObjFile == null)
                return BadRequest("obj are required");

            try
            {
                var objPath = await _blobService.UploadFileAsync(dto.ObjFile, $"openings/{dto.NameModel}");
                var objUrl = await _blobService.GetFileUrlAsync(objPath);

                string? textureUrl = null;
                string? mtlUrl = null;

                if (dto.MtlFile != null)
                {
                    var mtlPath = await _blobService.UploadFileAsync(dto.MtlFile, $"openings/{dto.NameModel}");
                    mtlUrl = await _blobService.GetFileUrlAsync(mtlPath);
                }

                if (dto.TextureFile != null)
                {
                    var texturePath = await _blobService.UploadFileAsync(dto.TextureFile, $"openings/{dto.NameModel}");
                    textureUrl = await _blobService.GetFileUrlAsync(texturePath);
                }

                return Ok(new
                {
                    objPath = objUrl,
                    mtlPath = mtlUrl,
                    texturePath = textureUrl,
                    nameModel = dto.NameModel
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Upload failed: {ex.Message}");
            }
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
            var furnitureModels = await _blobService.ListFurnitureModelsAsync("furnitures");
            return Ok(furnitureModels);
        }

        [HttpGet("openings")]
        public async Task<IActionResult> ListOpenings()
        {
            var openingModels = await _blobService.ListFurnitureModelsAsync("openings");
            return Ok(openingModels);
        }
    }
}