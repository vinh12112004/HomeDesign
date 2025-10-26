using home_design_backend.Models;

namespace home_design_backend.DTOs
{
    public class ProjectDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public float Width { get; set; }
        public float Length { get; set; }
        public float Height { get; set; }
        public string Status { get; set; } = "private";
        public DateTime Modified { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    public class CreateProjectDTO
    {
        public string Name { get; set; }
        public float Width { get; set; }
        public float Length { get; set; }
        public float Height { get; set; }
        public string Status { get; set; } = "private";
    }
}
