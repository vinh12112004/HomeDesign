using home_design_backend.DTOs;

namespace home_design_backend.Repositories
{
    public interface IRoomRepository
    {
        Task<List<RoomDTO.RoomDto>> GetAsync(Guid projectId);
        Task<List<RoomDTO.RoomDto>> GetAllAsync();
        Task<bool> CreateAsync(Guid projectId, RoomDTO.RoomDto dto);
        Task<RoomDTO.RoomDto?> UpdateAsync(Guid id, RoomDTO.UpdateRoomDto updateDto);
        Task<bool> DeleteAsync(Guid id);
    }
}