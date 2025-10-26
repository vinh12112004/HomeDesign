using AutoMapper;
using home_design_backend.Data;
using home_design_backend.DTOs;
using home_design_backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace home_design_backend.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;
        public ProjectRepository(AppDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public async Task<ProjectDTO> CreateAsync(CreateProjectDTO projectDTO)
        {
            Project project = _mapper.Map<Project>(projectDTO);
            project.Objects ??= new List<ProjectObject>();
            AddDefaultObjectsInline(project);
            await _dbContext.AddAsync(project);
            await _dbContext.SaveChangesAsync();
            return _mapper.Map<ProjectDTO>(project);
        }
        public async Task<bool> DeleteAsync(Guid id)
        {
            Project room = await GetAsync(id);
            _dbContext.Projects.Remove(room);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<Project>> GetAllAsync()
        {
            return await _dbContext.Projects.ToListAsync();
        }

        public async Task<Project> GetAsync(Guid id)
        {
            return await _dbContext.Projects.FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<bool> UpdateAsync(Guid id, ProjectDTO roomDTO)
        {
            Project room = await GetAsync(id);
            if (room == null)
                return false;

            _mapper.Map(roomDTO, room);
            room.Modified = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return true;
        }
        private void AddDefaultObjectsInline(Project project)
        {
            // Bạn có thể đổi ProjectObject -> RoomObject nếu tên entity khác
            float width = project.Width;
            float length = project.Length;
            float height = project.Height;

            float halfW = width / 2f;
            float halfL = length / 2f;
            float halfH = height / 2f;
            float wallThickness = 0.1f;

            string Scale1 = Serialize(new { x = 1, y = 1, z = 1 });

            // Floor
            project.Objects.Add(new ProjectObject
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Type = "Floor",
                AssetKey = "procedural/plane",
                PositionJson = Serialize(new { x = 0, y = 0, z = 0 }),
                RotationJson = Serialize(new { x = -MathF.PI / 2f, y = 0f, z = 0f }),
                ScaleJson = Scale1,
                MetadataJson = Serialize(new
                {
                    geometry = "plane",
                    width,
                    length,
                    texture = "/textures/floor.png",
                    color = "#F8F8FF"
                })
            });

            // Wall Left
            project.Objects.Add(new ProjectObject
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Type = "Wall",
                AssetKey = "procedural/box",
                PositionJson = Serialize(new { x = -halfW, y = halfH, z = 0 }),
                RotationJson = Serialize(new { x = 0f, y = 0f, z = 0f }),
                ScaleJson = Scale1,
                MetadataJson = Serialize(new
                {
                    geometry = "box",
                    sizeX = wallThickness,
                    sizeY = height,
                    sizeZ = length,
                    color = "#F8F8FF"
                })
            });

            // Wall Right
            project.Objects.Add(new ProjectObject
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Type = "Wall",
                AssetKey = "procedural/box",
                PositionJson = Serialize(new { x = halfW, y = halfH, z = 0 }),
                RotationJson = Serialize(new { x = 0f, y = 0f, z = 0f }),
                ScaleJson = Scale1,
                MetadataJson = Serialize(new
                {
                    geometry = "box",
                    sizeX = wallThickness,
                    sizeY = height,
                    sizeZ = length,
                    color = "#F8F8FF"
                })
            });

            // Wall Back
            project.Objects.Add(new ProjectObject
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Type = "Wall",
                AssetKey = "procedural/box",
                PositionJson = Serialize(new { x = 0, y = halfH, z = -halfL }),
                RotationJson = Serialize(new { x = 0f, y = MathF.PI / 2f, z = 0f }),
                ScaleJson = Scale1,
                MetadataJson = Serialize(new
                {
                    geometry = "box",
                    sizeX = wallThickness,
                    sizeY = height,
                    sizeZ = width,
                    color = "#F8F8FF"
                })
            });

            // Wall Front
            project.Objects.Add(new ProjectObject
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Type = "Wall",
                AssetKey = "procedural/box",
                PositionJson = Serialize(new { x = 0, y = halfH, z = halfL }),
                RotationJson = Serialize(new { x = 0f, y = MathF.PI / 2f, z = 0f }),
                ScaleJson = Scale1,
                MetadataJson = Serialize(new
                {
                    geometry = "box",
                    sizeX = wallThickness,
                    sizeY = height,
                    sizeZ = width,
                    color = "#F8F8FF"
                })
            });
        }

        private string Serialize(object obj) => JsonSerializer.Serialize(obj);
    }
}
