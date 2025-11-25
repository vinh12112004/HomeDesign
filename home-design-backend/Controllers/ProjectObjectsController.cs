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
        [HttpPost("{projectId}")]
        public async Task<IActionResult> Create(Guid projectId, [FromBody] ProjectObjectDto dto)
        {
            var result = await _projectObjectsRepository.CreateAsync(projectId, dto);
            return Ok(result);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _projectObjectsRepository.DeleteAsync(id);
            return Ok(result);
        }
        [HttpPost("{id}/createhole")]
        public async Task<IActionResult> CreateHole(Guid id, [FromBody] CreateHoleDto holeDto)
        {
            var result = await _projectObjectsRepository.AddHoleAsync(id, holeDto);
            if (!result) return NotFound("Wall not found or update failed");
            return Ok("Hole added successfully");
        }


    }
}
