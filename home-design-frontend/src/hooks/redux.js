import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for specific slices
export const useProjects = () => {
  return useAppSelector((state) => state.projects);
};

export const useObjects = () => {
  return useAppSelector((state) => state.objects);
};

export const useUI = () => {
  return useAppSelector((state) => state.ui);
};