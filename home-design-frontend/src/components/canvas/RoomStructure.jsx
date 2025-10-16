import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchObjects } from '../../store/slices/objectSlice';
import ObjectRenderer from './ObjectRenderer';

const RoomStructure = () => {
  const dispatch = useDispatch();
  const { objects, loading, error } = useSelector(state => state.objects);
  const { currentProject } = useSelector(state => state.projects);
  const projectId = currentProject ? currentProject.id : null;
  useEffect(() => {
    if (projectId) {
      dispatch(fetchObjects(projectId));
    }
  }, [dispatch, projectId]);

  if (loading) {
    return null; // Có thể thêm loading component ở đây
  }

  if (error && objects.length === 0) {
    console.error('Failed to load objects:', error);
    return null;
  }

  return (
    <group >
      {objects.map((objectData) => (
        <ObjectRenderer
          key={objectData.id}
          objectData={objectData}
        />
      ))}
    </group>
  );
};

export default RoomStructure;