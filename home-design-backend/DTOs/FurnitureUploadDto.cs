namespace home_design_backend.DTOs
{
    public class FurnitureUploadDto
    {
        public IFormFile ObjFile { get; set; }
        public IFormFile? MtlFile { get; set; } = null;
        public IFormFile? TextureFile { get; set; } = null;
        public string NameModel { get; set; }
    }
}
