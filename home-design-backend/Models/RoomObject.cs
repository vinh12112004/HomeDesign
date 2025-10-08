namespace home_design_backend.Models
{
    public class RoomObject
    {
        public Guid Id { get; set; }
        public Guid RoomId { get; set; }
        public Room Room { get; set; }

        public string Type { get; set; }
        public string AssetKey { get; set; }

        public string PositionJson { get; set; }
        public string RotationJson { get; set; }
        public string ScaleJson { get; set; }
        public string MetadataJson { get; set; }
    }
}
