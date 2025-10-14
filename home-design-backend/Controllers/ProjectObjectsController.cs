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
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var po = await _projectObjectsRepository.GetAsync(id);

            if (po == null) return NotFound();
            return Ok(po);
        }
    }
}
