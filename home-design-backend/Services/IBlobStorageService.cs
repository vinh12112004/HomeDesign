namespace home_design_backend.Services
{
    public interface IBlobStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string folder);
        Task<bool> DeleteFileAsync(string fileName);
        Task<string> GetFileUrlAsync(string fileName);
        Task<string> GetPresignedUrlAsync(string folder, string filename, int expiryInSeconds = 3600);
        Task<List<string>> ListFilesAsync(string folder, int expiryInSeconds = 3600);
    }
}
