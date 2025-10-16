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
            CreateMap<ProjectObject, ProjectObjectDto>();
            CreateMap<ProjectDTO, Project>();
            CreateMap<ProjectObjectDto, ProjectObject>();
            CreateMap<UpdateProjectObjectDto, ProjectObject>();
        }
    }
}
