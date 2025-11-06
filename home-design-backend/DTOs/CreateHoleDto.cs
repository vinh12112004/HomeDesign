namespace home_design_backend.DTOs
{
    public class CreateHoleDto
    {
        public double Width { get; set; }
        public double Height { get; set; }
        public double Depth { get; set; } = 0.1;
        public HoleCenterDto Center { get; set; } = new HoleCenterDto();
    }

    public class HoleCenterDto
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Z { get; set; }
    }
}
