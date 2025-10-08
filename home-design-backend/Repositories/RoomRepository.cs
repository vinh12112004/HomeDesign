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
        public async Task<bool> CreateAsync(RoomDTO roomDTO)
        {
            Room room = _mapper.Map<Room>(roomDTO);
            await _dbContext.AddAsync(room);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteAsync(Guid id)
        {
            Room room = await GetAsync(id);
            _dbContext.Remove(room);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<Room>> GetAllAsync()
        {
            return await _dbContext.Rooms.ToListAsync();
        }

        public async Task<Room> GetAsync(Guid id)
        {
            return await _dbContext.Rooms.FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<bool> UpdateAsync(Guid id, RoomDTO roomDTO)
        {
            Room room = await GetAsync(id);
            if (room == null)
                return false;

            _mapper.Map(roomDTO, room);
            room.Modified = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
