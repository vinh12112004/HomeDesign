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
    public class CreateRoomDTO
    {
        public float X { get; set; } // Tọa độ trung tâm X
        public float Z { get; set; } // Tọa độ trung tâm Z
        public float Width { get; set; } // Chiều rộng phòng
        public float Length { get; set; } // Chiều dài phòng
        public float Height { get; set; } = 2.5f; // Chiều cao mặc định
    }
    public class MoveRoomDTO
    {
        public float newOffsetX { get; set; }
        public float newOffsetZ { get; set; }
    }
}
