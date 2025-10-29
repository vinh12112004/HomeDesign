import React, { useEffect, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';

export default function OBJModel({ 
  objPath,
  mtlPath,
  position,
  rotation,
  scale,
  castShadow,
  receiveShadow,
  userData 
}) {
  const groupRef = useRef();
  const materials = mtlPath ? useLoader(MTLLoader, mtlPath) : null

  const object = useLoader(OBJLoader, objPath, (loader) => {
    if (materials) loader.setMaterials(materials)
  })

  // Nếu không có MTL, gán màu mặc định
  if (!materials) {
    object.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
      }
    })
  }

  useEffect(() => {
    if (!object) return;

    // Áp dụng shadow + userData cho tất cả mesh con trong object
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
        // Thêm userData vào mesh con để có thể click
        child.userData = {
          ...child.userData,
          ...userData,
        };
      }
    });
  }, [object, castShadow, receiveShadow, userData]);

  // Log vị trí khi group thay đổi (debug)
  useEffect(() => {
    if (groupRef.current) {
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      console.log(`📦 OBJ Model ${userData.objectId} loaded at:`, {
        position: { x: pos.x.toFixed(2), y: pos.y.toFixed(2), z: pos.z.toFixed(2) },
        rotation: { x: rot.x.toFixed(2), y: rot.y.toFixed(2), z: rot.z.toFixed(2) }
      });
    }
  }, [userData.objectId]);

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={userData}
      name={`obj-model-${userData.objectId}`}
    >
      <primitive object={object} />
    </group>
  );
}