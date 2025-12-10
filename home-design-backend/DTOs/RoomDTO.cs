namespace home_design_backend.DTOs;

public class RoomDTO
{
    public class RoomDto
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string? Name { get; set; }

        // Vị trí toạ độ của phòng
        public float OffsetX { get; set; }
        public float OffsetY { get; set; }
        public float OffsetZ { get; set; }
    }
    
    public class UpdateRoomDto
    {
        public string? Name { get; set; }
        public float OffsetX { get; set; }
        public float OffsetY { get; set; }
        public float OffsetZ { get; set; }
    }
    public class CreateRoomDTO
    {
        public float X { get; set; } // Tọa độ trung tâm X
        public float Z { get; set; } // Tọa độ trung tâm Z
        public float Width { get; set; } // Chiều rộng phòng
        public float Length { get; set; } // Chiều dài phòng
        public float Height { get; set; } = 2.5f; // Chiều cao mặc định
        public string? Name { get; set; } = null;
    }
    public class MoveRoomDTO
    {
        public float newOffsetX { get; set; }
        public float newOffsetZ { get; set; }
    }
}