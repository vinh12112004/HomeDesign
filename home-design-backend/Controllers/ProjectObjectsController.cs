using home_design_backend.DTOs;
using home_design_backend.Models;
using home_design_backend.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace home_design_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectObjectsController : ControllerBase
    {
        private readonly IProjectObjectsRepository _projectObjectsRepository;

        public ProjectObjectsController(IProjectObjectsRepository projectObjectsRepository)
        {
            _projectObjectsRepository = projectObjectsRepository;            
        }
        [HttpGet("{projectId}")]
        public async Task<IActionResult> Get(Guid projectId)
        {
            var po = await _projectObjectsRepository.GetAsync(projectId);

            if (po == null) return NotFound();
            return Ok(po);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectObjectDto updateDto)
        {
            var po = await _projectObjectsRepository.UpdateAsync(id,updateDto);
            return Ok(po);
        }
    }
}
