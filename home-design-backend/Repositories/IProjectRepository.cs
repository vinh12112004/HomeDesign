using home_design_backend.DTOs;
using home_design_backend.Models;

namespace home_design_backend.Repositories
{
    public interface IProjectRepository
    {
        Task<ProjectDTO> CreateAsync(CreateProjectDTO roomDTO);
        Task<Project> GetAsync(Guid id);
        Task<List<Project>> GetAllAsync();
        Task<bool> UpdateAsync(Guid id, ProjectDTO room);
        Task<bool> DeleteAsync(Guid id);
        Task<List<ProjectObject>> AddRoomAsync(CreateRoomDTO dto, Guid projectId);
    }
}
