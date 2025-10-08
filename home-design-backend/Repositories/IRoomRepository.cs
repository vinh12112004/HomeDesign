using home_design_backend.DTOs;
using home_design_backend.Models;

namespace home_design_backend.Repositories
{
    public interface IRoomRepository
    {
        Task<bool> CreateAsync(RoomDTO roomDTO);
        Task<Room> GetAsync(Guid id);
        Task<List<Room>> GetAllAsync();
        Task<bool> UpdateAsync(Guid id, RoomDTO room);
        Task<bool> DeleteAsync(Guid id);
    }
}
