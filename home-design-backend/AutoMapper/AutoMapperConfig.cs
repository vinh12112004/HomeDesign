using AutoMapper;
using home_design_backend.DTOs;
using home_design_backend.Models;

namespace home_design_backend.AutoMapper
{
    public class AutoMapperConfig : Profile
    {
        public AutoMapperConfig()
        {
            CreateMap<Project, ProjectDTO>();
            CreateMap<ProjectDTO, Project>();

            CreateMap<ProjectObject, ProjectObjectDto>();
            CreateMap<ProjectObjectDto, ProjectObject>();

            CreateMap<CreateProjectDTO, Project>();
            CreateMap<Project, CreateProjectDTO>();
        

            CreateMap<UpdateProjectObjectDto, ProjectObject>();
            
            CreateMap<Room, RoomDTO.RoomDto>().ReverseMap();
            CreateMap<RoomDTO.UpdateRoomDto, Room>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<RoomDTO.CreateRoomDTO, Room>()
                .ForMember(dest => dest.OffsetX, opt => opt.MapFrom(src => src.X))
                .ForMember(dest => dest.OffsetZ, opt => opt.MapFrom(src => src.Z));
        }
    }
}
