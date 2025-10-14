using AutoMapper;
using home_design_backend.Data;
using home_design_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace home_design_backend.Repositories
{
    public class ProjectObjectsRepository : IProjectObjectsRepository
    {
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;
        public ProjectObjectsRepository(AppDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public async Task<List<ProjectObject>> GetAsync(Guid id)
        {
            return await _dbContext.ProjectObjects.Where(po => po.ProjectId == id).ToListAsync();
        }
    }
}
