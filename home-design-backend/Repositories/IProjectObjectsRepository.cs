using home_design_backend.Models;

namespace home_design_backend.Repositories
{
    public interface IProjectObjectsRepository
    {
        Task<List<ProjectObject>> GetAsync(Guid id);
    }
}
