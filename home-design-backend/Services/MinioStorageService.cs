using Minio;
using Minio.DataModel;
using Minio.DataModel.Args;

namespace home_design_backend.Services
{
    public class MinioStorageService : IBlobStorageService
    {
        private readonly IMinioClient _minio;
        private readonly string _bucket;

        public MinioStorageService(IConfiguration config)
        {
            var section = config.GetSection("Minio");
            _bucket = section["Bucket"];

            _minio = new MinioClient()
                .WithEndpoint(section["Endpoint"])
                .WithCredentials(section["AccessKey"], section["SecretKey"]);

            if (bool.TryParse(section["UseSSL"], out bool useSsl) && useSsl)
                _minio = _minio.WithSSL();

            _minio = _minio.Build();
        }
        public async Task EnsureBucketExistsAsync(string bucketName)
        {
            bool exists = await _minio.BucketExistsAsync(new BucketExistsArgs().WithBucket(bucketName));
            if (!exists)
            {
                await _minio.MakeBucketAsync(new MakeBucketArgs().WithBucket(bucketName));

                // Gán policy public read
                string policyJson = $@"
                {{
                    ""Version"": ""2012-10-17"",
                    ""Statement"": [
                        {{
                            ""Effect"": ""Allow"",
                            ""Principal"": {{ ""AWS"": [""*""] }},
                            ""Action"": [""s3:GetObject""],
                            ""Resource"": [""arn:aws:s3:::{bucketName}/*""]
                        }}
                    ]
                }}";

                await _minio.SetPolicyAsync(new SetPolicyArgs()
                    .WithBucket(bucketName)
                    .WithPolicy(policyJson)
                );
            }
        }


        public async Task<string> UploadFileAsync(IFormFile file, string folder)
        {
            string bucketName = "homedesign";
            await EnsureBucketExistsAsync(bucketName);

            var fileName = $"{folder}/{file.FileName}";

            using var stream = file.OpenReadStream();
            await _minio.PutObjectAsync(new PutObjectArgs()
                .WithBucket(_bucket)
                .WithObject(fileName)
                .WithStreamData(stream)
                .WithObjectSize(stream.Length)
                .WithContentType(file.ContentType));

            return fileName;
        }

        public async Task<bool> DeleteFileAsync(string fileName)
        {
            await _minio.RemoveObjectAsync(new RemoveObjectArgs()
                .WithBucket(_bucket)
                .WithObject(fileName));
            return true;
        }

        public Task<string> GetFileUrlAsync(string fileName)
        {
            return Task.FromResult($"http://localhost:9000/{_bucket}/{fileName}");
        }

        public async Task<string> GetPresignedUrlAsync(string folder, string filename, int expiryInSeconds = 3600)
        {
            string objectName = $"{folder}/{filename}";

            string url = await _minio.PresignedGetObjectAsync(
                new PresignedGetObjectArgs()
                    .WithBucket(_bucket)
                    .WithObject(objectName)
                    .WithExpiry(expiryInSeconds)
            );

            return url;
        }
        public async Task<List<string>> ListFilesAsync(string folder, int expiryInSeconds = 3600)
        {
            var results = new List<string>();
            var prefix = string.IsNullOrWhiteSpace(folder) ? "" : $"{folder.TrimEnd('/')}/";

            var args = new ListObjectsArgs()
                .WithBucket(_bucket)
                .WithPrefix(prefix)
                .WithRecursive(true);

            await foreach (var item in _minio.ListObjectsEnumAsync(args))
            {
                if (item.IsDir) continue;
                var path = item.Key; // ví dụ: "textures/uuid_name.png"
                var url = await GetFileUrlAsync(path);
                results.Add(url);
            }

            return results;
        }
        public async Task<List<FurnitureModel>> ListFurnitureModelsAsync(string folder, int expiryInSeconds = 3600)
        {
            var furnitureDict = new Dictionary<string, FurnitureModel>();
            var prefix = string.IsNullOrWhiteSpace(folder) ? "" : $"{folder.TrimEnd('/')}/";

            var args = new ListObjectsArgs()
                .WithBucket(_bucket)
                .WithPrefix(prefix)
                .WithRecursive(true);

            await foreach (var item in _minio.ListObjectsEnumAsync(args))
            {
                if (item.IsDir) continue;

                // Parse path: furnitures/{nameModel}/{filename}
                var parts = item.Key.Split('/');
                if (parts.Length < 3) continue;

                var nameModel = parts[1];
                var fileName = parts[2];
                var fileExt = Path.GetExtension(fileName).ToLower();
                var url = await GetFileUrlAsync(item.Key);

                if (!furnitureDict.ContainsKey(nameModel))
                {
                    furnitureDict[nameModel] = new FurnitureModel { NameModel = nameModel };
                }

                var model = furnitureDict[nameModel];

                if (fileExt == ".obj")
                    model.ObjPath = url;
                else if (fileExt == ".mtl")
                    model.MtlPath = url;
                else if (fileExt == ".jpg" || fileExt == ".jpeg" || fileExt == ".png")
                    model.TexturePath = url;
            }

            // Filter out incomplete models
            return furnitureDict.Values
                .Where(m => !string.IsNullOrEmpty(m.ObjPath) &&
                           !string.IsNullOrEmpty(m.MtlPath) &&
                           !string.IsNullOrEmpty(m.TexturePath))
                .ToList();
        }
    }
}
