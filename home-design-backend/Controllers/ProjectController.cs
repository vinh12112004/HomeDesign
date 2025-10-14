// Controllers/RoomsController.cs
using home_design_backend.Data;
using home_design_backend.DTOs;
using home_design_backend.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace HomeDesign.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectRepository _roomRepository;

        public ProjectController(IProjectRepository roomRepository)
        {
           _roomRepository = roomRepository;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] ProjectDTO room)
        {
            await _roomRepository.CreateAsync(room);
            return Ok("Create Success");
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rooms = await _roomRepository.GetAllAsync();
            return Ok(rooms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var room = await _roomRepository.GetAsync(id);

            if (room == null) return NotFound();
            return Ok(room);
        }
        [HttpPut]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProjectDTO room)
        {
            return Ok(await _roomRepository.UpdateAsync(id, room));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await _roomRepository.DeleteAsync(id));
        }
    }
}
