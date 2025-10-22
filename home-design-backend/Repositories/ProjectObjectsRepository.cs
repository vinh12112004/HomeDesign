using AutoMapper;
using home_design_backend.Data;
using home_design_backend.DTOs;
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
        public async Task<List<ProjectObjectDto>> GetAsync(Guid projectId)
        {
            var lpo = await _dbContext.ProjectObjects.Where(po => po.ProjectId == projectId).ToListAsync();
            var lpodto = _mapper.Map<List<ProjectObjectDto>>(lpo);
            return lpodto;
        }
        public async Task<ProjectObjectDto?> UpdateAsync(Guid id, UpdateProjectObjectDto updateDto)
        {
            var existingObject = await _dbContext.ProjectObjects
                .FirstOrDefaultAsync(po => po.Id == id);

            if (existingObject == null)
                return null;

            _mapper.Map(updateDto, existingObject);
            _dbContext.Update(existingObject);
            var updateResDto = _mapper.Map<ProjectObjectDto>(existingObject);
            await _dbContext.SaveChangesAsync();
            return updateResDto;
        }
        public async Task<bool> CreateAsync(Guid projectId, ProjectObjectDto dto)
        {
            
            ProjectObject projectObject = _mapper.Map<ProjectObject>(dto);
            projectObject.ProjectId = projectId;
            projectId = Guid.NewGuid();
            await _dbContext.AddAsync(projectObject);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
