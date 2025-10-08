using home_design_backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace home_design_backend.Data
{
    public class AppDbContext : DbContext 
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomObject> RoomObjects { get; set; }
    }
}
