import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHoveredMesh, setSelectedMesh } from '../../store/slices/uiSlice';

const SelectableObject = ({ children }) => {
  const ref = useRef();
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const { viewMode } = useSelector(state => state.ui);

  // const handleHoverChange = (mesh, isHovering) => {
  //   if (viewMode === 'fixed') {
  //     // console.log('Setting hovered mesh:', isHovering ? mesh.userData.objectId : null);
  //     dispatch(setHoveredMesh(isHovering ? mesh.userData.objectId : null));
  //   }
  // };

  const handlePointerDown = (e) => {
    if (viewMode === 'fixed') {
      setIsDragging(false);
    }
  };

  const handlePointerMove = (e) => {
    if (viewMode === 'fixed' && e.buttons > 0) {
      setIsDragging(true);
    }
  };

  const handlePointerUp = () => {
    setTimeout(() => setIsDragging(false), 100);
  };

  // const handlePointerOver = (e) => {
  //   e.stopPropagation(); // Ngăn event bubble
  //   if (viewMode === 'fixed' && !isDragging) {
  //     // Tìm mesh có userData.objectId (tránh hover vào mesh con)
  //     let targetMesh = e.object;
  //     while (targetMesh && !targetMesh.userData?.objectId) {
  //       targetMesh = targetMesh.parent;
  //       if (!targetMesh || targetMesh.type !== 'Mesh') break;
  //     }
      
  //     if (targetMesh && targetMesh.userData?.objectId) {
  //       // console.log('Hovering over mesh userData:', targetMesh.userData.objectId);
  //       handleHoverChange(targetMesh, true);
  //     }
  //   }
  // };

  // const handlePointerOut = (e) => {
  //   e.stopPropagation();
  //   if (viewMode === 'fixed') {
  //     let targetMesh = e.object;
  //     while (targetMesh && !targetMesh.userData?.objectId) {
  //       targetMesh = targetMesh.parent;
  //       if (!targetMesh || targetMesh.type !== 'Mesh') break;
  //     }
      
  //     if (targetMesh && targetMesh.userData?.objectId) {
  //       // console.log('Leaving mesh userData:', targetMesh.userData.objectId);
  //       handleHoverChange(targetMesh, false);
  //     }
  //   }
  // };

  const handleClick = (e) => {
    e.stopPropagation();
    if (viewMode === 'fixed' && !isDragging) {
      let targetMesh = e.object;
      while (targetMesh && !targetMesh.userData?.objectId) {
        targetMesh = targetMesh.parent;
        if (!targetMesh || targetMesh.type !== 'Mesh') break;
      }
      
      if (targetMesh && targetMesh.userData?.objectId) {
        // console.log('Selecting object:', targetMesh.userData.objectId);
        dispatch(setSelectedMesh(targetMesh.userData.objectId));
      }
    }
  };

  return (
    <group
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      // onPointerOver={handlePointerOver}
      // onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}
    </group>
  );
};

export default SelectableObject;