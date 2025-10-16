using home_design_backend.DTOs;
using home_design_backend.Models;

namespace home_design_backend.Repositories
{
    public interface IProjectObjectsRepository
    {
        Task<List<ProjectObjectDto>> GetAsync(Guid id);
        Task<ProjectObject?> UpdateAsync(Guid id, UpdateProjectObjectDto updateDto);
    }
}
