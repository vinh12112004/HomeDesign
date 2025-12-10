// Controllers/ProjectController.cs
using home_design_backend.Data;
using home_design_backend.DTOs;
using home_design_backend.Models;
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
        private readonly IProjectRepository _projectRepository;

        public ProjectController(IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDTO project)
        {
            try
            {
                var result = await _projectRepository.CreateAsync(project);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi tạo project", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _projectRepository.GetAllAsync();
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var project = await _projectRepository.GetAsync(id);

            if (project == null) return NotFound(new { message = "Project không tồn tại" });
            return Ok(project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProjectDTO project)
        {
            var result = await _projectRepository.UpdateAsync(id, project);
            if (!result) return NotFound(new { message = "Project không tồn tại" });

            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _projectRepository.DeleteAsync(id);
                if (!result) return NotFound(new { message = "Project không tồn tại" });

                return Ok(new { message = "Xóa project thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa project", error = ex.Message });
            }
        }

        [HttpPost("{projectId}/rooms")]
        public async Task<IActionResult> AddRoom(Guid projectId, [FromBody] RoomDTO.CreateRoomDTO dto)
        {
            try
            {
                // Validate DTO
                if (dto.Width <= 0 || dto.Length <= 0 || dto.Height <= 0)
                {
                    return BadRequest(new { message = "Kích thước phòng phải lớn hơn 0" });
                }

                var roomObjects = await _projectRepository.AddRoomAsync(dto, projectId);

                if (roomObjects == null)
                    return NotFound(new { message = "Project không tồn tại" });

                return Ok(new
                {
                    message = "Phòng được tạo thành công",
                    objectCount = roomObjects.Count,
                    objects = roomObjects
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Lỗi khi thêm phòng",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
        [HttpPost("rooms/{roomId}/move")]
        public async Task<IActionResult> MoveRoom(Guid roomId, RoomDTO.MoveRoomDTO moveRoomDto)
        {
            try
            {
                var result = await _projectRepository.MoveRoomAsync(roomId, moveRoomDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Lỗi khi di chuyển phòng",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}