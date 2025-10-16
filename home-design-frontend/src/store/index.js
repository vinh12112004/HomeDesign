import { configureStore } from '@reduxjs/toolkit';
import projectSlice from './slices/projectSlice';
import objectSlice from './slices/objectSlice';
import uiSlice from './slices/uiSlice';
import { useSelector, useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    projects: projectSlice,
    objects: objectSlice,
    ui: uiSlice,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Three.js objects
        ignoredActions: ['ui/setHoveredMesh', 'ui/setSelectedMesh'],
        ignoredPaths: ['ui.hoveredMesh', 'ui.selectedMesh'],
      },
    }),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;