namespace home_design_backend.DTOs
{
    public class RoomObjectDto
    {
        public string Type { get; set; }
        public string AssetKey { get; set; }
        public string PositionJson { get; set; }
        public string RotationJson { get; set; }
        public string ScaleJson { get; set; }
        public string MetadataJson { get; set; }
    }
}
