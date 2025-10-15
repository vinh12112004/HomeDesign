import React from 'react';
import { useObjectProject } from '../../hooks/useObjectProject';
import ObjectRenderer from './ObjectRenderer';

const RoomStructure = ({ width, length, height, viewMode, onHoverChange, hoveredMesh, projectId }) => {
  const { 
    objects, 
    loading, 
    error,
    createObject, 
    updateObject, 
    deleteObject
  } = useObjectProject(projectId);

  if (loading) {
    return null; // Có thể thêm loading component ở đây
  }

  if (error && objects.length === 0) {
    console.error('Failed to load objects:', error);
    return null;
  }

  return (
    <group userData={{ createObject, updateObject, deleteObject }}>
      {objects.map((objectData) => (
        <ObjectRenderer
          key={objectData.id}
          objectData={objectData}
          viewMode={viewMode}
          onHoverChange={onHoverChange}
          hoveredMesh={hoveredMesh}
        />
      ))}
    </group>
  );
};

export default RoomStructure;