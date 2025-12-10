using AutoMapper;
using home_design_backend.Data;
using home_design_backend.DTOs;
using home_design_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace home_design_backend.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;

        public RoomRepository(AppDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        // Lấy danh sách Room theo ProjectId
        public async Task<List<RoomDTO.RoomDto>> GetAsync(Guid projectId)
        {
            var rooms = await _dbContext.Rooms
                                        .Where(r => r.ProjectId == projectId)
                                        .ToListAsync();
            var roomDtos = _mapper.Map<List<RoomDTO.RoomDto>>(rooms);
            return roomDtos;
        }

        // Cập nhật Room
        public async Task<RoomDTO.RoomDto?> UpdateAsync(Guid id, RoomDTO.UpdateRoomDto updateDto)
        {
            var existingRoom = await _dbContext.Rooms
                .FirstOrDefaultAsync(r => r.Id == id);

            if (existingRoom == null)
                return null;

            // Map dữ liệu mới vào entity cũ
            _mapper.Map(updateDto, existingRoom);
            
            _dbContext.Update(existingRoom);
            await _dbContext.SaveChangesAsync();

            // Return lại DTO đã update
            var updateResDto = _mapper.Map<RoomDTO.RoomDto>(existingRoom);
            return updateResDto;
        }

        // Tạo mới Room
        public async Task<bool> CreateAsync(Guid projectId, RoomDTO.RoomDto dto)
        {
            Room room = _mapper.Map<Room>(dto);
            
            // Gán các giá trị định danh
            room.ProjectId = projectId;
            
            // Nếu Id chưa có trong DTO thì tạo mới (tuỳ logic của bạn)
            if (room.Id == Guid.Empty)
            {
                room.Id = Guid.NewGuid();
            }

            await _dbContext.Rooms.AddAsync(room);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        // Xóa Room
        public async Task<bool> DeleteAsync(Guid id)
        {
            var existingRoom = await _dbContext.Rooms
                .FirstOrDefaultAsync(r => r.Id == id);

            if (existingRoom == null)
                return false;

            _dbContext.Rooms.Remove(existingRoom);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}