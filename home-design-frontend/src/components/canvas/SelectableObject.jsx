import React, { useRef, useState } from 'react';

const SelectableObject = ({ children, onHoverChange, viewMode }) => {
  const ref = useRef();
  const [isDragging, setIsDragging] = useState(false);

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

  const handlePointerOver = (e) => {
    e.stopPropagation();
    // Chỉ highlight khi ở chế độ fixed và không đang kéo
    if (viewMode === 'fixed' && !isDragging) {
      // Lấy mesh thực sự từ event thay vì ref
      const actualMesh = e.object;
      console.log('Actual mesh:', actualMesh);
      onHoverChange?.(actualMesh, true);
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    if (viewMode === 'fixed') {
      const actualMesh = e.object;
      onHoverChange?.(actualMesh, false);
    }
  };

  return (
    <group
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {children}
    </group>
  );
};

export default SelectableObject;