namespace home_design_backend.Models;

public class Room
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string? Name { get; set; }

    // Offset toàn phòng
    public float OffsetX { get; set; }
    public float OffsetY { get; set; }
    public float OffsetZ { get; set; }
}
