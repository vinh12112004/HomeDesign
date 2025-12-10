using AutoMapper;
using home_design_backend.DTOs;
using home_design_backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace home_design_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomRepository _roomRepo;
        private readonly IMapper _mapper;

        public RoomsController(IRoomRepository roomRepo, IMapper mapper)
        {
            _roomRepo = roomRepo;
            _mapper = mapper;
        }

        // GET: api/rooms/project/{projectId}
        // Lấy danh sách phòng theo ProjectId
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProjectId(Guid projectId)
        {
            var rooms = await _roomRepo.GetAsync(projectId);
            return Ok(rooms);
        }

        // POST: api/rooms/project/{projectId}
        // Tạo phòng mới
        [HttpPost("project/{projectId}")]
        public async Task<IActionResult> CreateRoom(Guid projectId, [FromBody] RoomDTO.CreateRoomDTO createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Chuyển đổi từ CreateRoomDTO (Client gửi) sang RoomDto (Repo cần)
            // Lưu ý: Width/Length/Height không có trong Model Room nên tạm thời chỉ lưu tọa độ X, Z
            var roomDto = new RoomDTO.RoomDto
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Name = "New Room", // Có thể để client gửi lên hoặc set mặc định
                OffsetX = createDto.X,
                OffsetZ = createDto.Z,
                OffsetY = 0 // Mặc định sàn
            };

            var result = await _roomRepo.CreateAsync(projectId, roomDto);

            if (result)
            {
                return Ok(new { Message = "Room created successfully", RoomId = roomDto.Id });
            }

            return StatusCode(500, "An error occurred while creating the room.");
        }

        // PUT: api/rooms/{id}
        // Cập nhật thông tin chung của phòng (Tên, vị trí...)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] RoomDTO.UpdateRoomDto updateDto)
        {
            var updatedRoom = await _roomRepo.UpdateAsync(id, updateDto);

            if (updatedRoom == null)
                return NotFound("Room not found.");

            return Ok(updatedRoom);
        }

        // PUT: api/rooms/{id}/move
        // API chuyên biệt để di chuyển phòng (Sử dụng MoveRoomDTO)
        [HttpPut("{id}/move")]
        public async Task<IActionResult> MoveRoom(Guid id, [FromBody] RoomDTO.MoveRoomDTO moveDto)
        {
            // Tạo UpdateDto từ MoveRoomDTO
            var updateDto = new RoomDTO.UpdateRoomDto
            {
                OffsetX = moveDto.newOffsetX,
                OffsetZ = moveDto.newOffsetZ
                // Giữ nguyên OffsetY hoặc Name nếu cần xử lý thêm logic lấy dữ liệu cũ
            };

            // Lưu ý: Logic này sẽ set Name = null nếu UpdateRoomDto không được xử lý ignore null trong AutoMapper
            // Để an toàn nhất, Repo nên hỗ trợ Patch hoặc bạn lấy room cũ ra trước rồi map đè lên.
            // Dưới đây là cách gọi Repo UpdateAsync hiện có:
            
            var result = await _roomRepo.UpdateAsync(id, updateDto);

            if (result == null)
                return NotFound("Room not found.");

            return Ok(result);
        }

        // DELETE: api/rooms/{id}
        // Xóa phòng
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(Guid id)
        {
            var result = await _roomRepo.DeleteAsync(id);

            if (!result)
                return NotFound("Room not found.");

            return NoContent();
        }
    }
}