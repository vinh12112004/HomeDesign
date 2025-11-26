namespace home_design_backend.DTOs
{
    public class ProjectObjectDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string AssetKey { get; set; } = string.Empty;
        public string PositionJson { get; set; } = string.Empty;
        public string RotationJson { get; set; } = string.Empty;
        public string ScaleJson { get; set; } = string.Empty;
        public string MetadataJson { get; set; } = string.Empty;
        public Guid RoomId { get; set; }
    }
}
