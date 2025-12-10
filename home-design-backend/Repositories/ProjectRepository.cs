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
        private Task AddDefaultObjectsInline(Project project)
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
            // Tạo Room mặc định cho project
            var defaultRoom = new Room
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Name = "Default Room",
                OffsetX = 0,
                OffsetY = 0,
                OffsetZ = 0
            };

            _dbContext.Rooms.Add(defaultRoom);
            Console.WriteLine($"{defaultRoom.Id}");
            // Floor
            project.Objects.Add(new ProjectObject
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                RoomId = defaultRoom.Id,
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
                RoomId = defaultRoom.Id,
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
                RoomId = defaultRoom.Id,
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
                RoomId = defaultRoom.Id,
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
                RoomId = defaultRoom.Id,
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
            return Task.CompletedTask;
        }
        public async Task<List<ProjectObject>> AddRoomAsync(RoomDTO.CreateRoomDTO dto, Guid projectId)
        {
            var project = await _dbContext.Projects
                .Include(p => p.Objects)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return null;

            float halfW = dto.Width / 2f;
            float halfL = dto.Length / 2f;
            float halfH = dto.Height / 2f;
            float wallThickness = 0.1f;

            string scaleJson = Serialize(new { x = 1, y = 1, z = 1 });
            var newRoom = new Room
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Name = dto.Name,
                OffsetX = dto.X,
                OffsetY = 0,
                OffsetZ = dto.Z
            };
            _dbContext.Rooms.Add(newRoom);
            var newObjects = new List<ProjectObject>();

            // Floor
            newObjects.Add(new ProjectObject
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                RoomId = newRoom.Id,
                Type = "Floor",
                AssetKey = "procedural/plane",
                PositionJson = Serialize(new { x = dto.X, y = 0, z = dto.Z }),
                RotationJson = Serialize(new { x = -MathF.PI / 2f, y = 0f, z = 0f }),
                ScaleJson = scaleJson,
                MetadataJson = Serialize(new
                {
                    geometry = "plane",
                    width = dto.Width,
                    length = dto.Length,
                    texture = "/textures/floor.png",
                    color = "#F8F8FF"
                })
            });

            // Walls
            newObjects.AddRange(CreateWalls(dto, projectId, halfW, halfL, halfH, wallThickness, scaleJson, newRoom.Id));

            // Add objects directly to DbContext instead of through navigation property
            await _dbContext.ProjectObjects.AddRangeAsync(newObjects);

            // Save changes
            await _dbContext.SaveChangesAsync();

            return newObjects;
        }

        public async Task<bool> MoveRoomAsync(Guid roomId, RoomDTO.MoveRoomDTO moveRoomDto)
        {
            // Lấy room
            var room = await _dbContext.Rooms.FirstOrDefaultAsync(r => r.Id == roomId);
            if (room == null) return false;

            float deltaX = moveRoomDto.newOffsetX - room.OffsetX;
            float deltaZ = moveRoomDto.newOffsetZ - room.OffsetZ;

            // Cập nhật offset của room
            room.OffsetX = moveRoomDto.newOffsetX;
            room.OffsetZ = moveRoomDto.newOffsetZ;

            // Lấy các project object trong room
            var objects = await _dbContext.ProjectObjects
                .Where(o => o.RoomId == roomId)
                .ToListAsync();

            foreach (var obj in objects)
            {
                // Deserialize position hiện tại
                var position = JsonSerializer.Deserialize<PositionDTO>(obj.PositionJson);
                if (position == null) continue;

                // Trừ đi delta offset
                position.x += deltaX;
                position.z += deltaZ;

                // Serialize lại
                obj.PositionJson = JsonSerializer.Serialize(position);
            }

            await _dbContext.SaveChangesAsync();
            return true;
        }

        private List<ProjectObject> CreateWalls(RoomDTO.CreateRoomDTO dto, Guid projectId, float halfW, float halfL, float halfH, float wallThickness, string scaleJson, Guid roomid)
        {
            return new List<ProjectObject>
            {
                // Left Wall
                new ProjectObject {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    RoomId = roomid,
                    Type = "Wall",
                    AssetKey = "procedural/box",
                    PositionJson = Serialize(new { x = dto.X - halfW, y = halfH, z = dto.Z }),
                    RotationJson = Serialize(new { x = 0f, y = 0f, z = 0f }),
                    ScaleJson = scaleJson,
                    MetadataJson = Serialize(new {
                        geometry = "box",
                        sizeX = wallThickness,
                        sizeY = dto.Height,
                        sizeZ = dto.Length,
                        color = "#F8F8FF"
                    })
                },
                // Right Wall
                new ProjectObject {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    RoomId = roomid,
                    Type = "Wall",
                    AssetKey = "procedural/box",
                    PositionJson = Serialize(new { x = dto.X + halfW, y = halfH, z = dto.Z }),
                    RotationJson = Serialize(new { x = 0f, y = 0f, z = 0f }),
                    ScaleJson = scaleJson,
                    MetadataJson = Serialize(new {
                        geometry = "box",
                        sizeX = wallThickness,
                        sizeY = dto.Height,
                        sizeZ = dto.Length,
                        color = "#F8F8FF"
                    })
                },
                // Back Wall
                new ProjectObject {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    RoomId = roomid,
                    Type = "Wall",
                    AssetKey = "procedural/box",
                    PositionJson = Serialize(new { x = dto.X, y = halfH, z = dto.Z - halfL }),
                    RotationJson = Serialize(new { x = 0f, y = MathF.PI / 2f, z = 0f }),
                    ScaleJson = scaleJson,
                    MetadataJson = Serialize(new {
                        geometry = "box",
                        sizeX = wallThickness,
                        sizeY = dto.Height,
                        sizeZ = dto.Width,
                        color = "#F8F8FF"
                    })
                },
                // Front Wall
                new ProjectObject {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    RoomId = roomid,
                    Type = "Wall",
                    AssetKey = "procedural/box",
                    PositionJson = Serialize(new { x = dto.X, y = halfH, z = dto.Z + halfL }),
                    RotationJson = Serialize(new { x = 0f, y = MathF.PI / 2f, z = 0f }),
                    ScaleJson = scaleJson,
                    MetadataJson = Serialize(new {
                        geometry = "box",
                        sizeX = wallThickness,
                        sizeY = dto.Height,
                        sizeZ = dto.Width,
                        color = "#F8F8FF"
                    })
                }
            };
        }

        private string Serialize(object obj) => JsonSerializer.Serialize(obj);
    }
}
