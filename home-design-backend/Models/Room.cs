using System.Runtime.InteropServices.Marshalling;

namespace home_design_backend.Models
{
    public class Room
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public float Width { get; set; }
        public float Length { get; set; }
        public float Height { get; set; }
        public string Status { get; set; }
        public DateTime Modified { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<RoomObject> Objects { get; set; }
    }
}
