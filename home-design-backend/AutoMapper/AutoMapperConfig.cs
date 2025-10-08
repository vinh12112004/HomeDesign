using AutoMapper;
using home_design_backend.DTOs;
using home_design_backend.Models;

namespace home_design_backend.AutoMapper
{
    public class AutoMapperConfig : Profile
    {
        public AutoMapperConfig()
        {
            CreateMap<Room, RoomDTO>();
            CreateMap<RoomObject, RoomObjectDto>();
            CreateMap<RoomDTO, Room>();
            CreateMap<RoomObjectDto, RoomObject>();
        }
    }
}
