import React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import SelectableObject from './SelectableObject';

const RoomStructure = ({ width, length, height, viewMode, onHoverChange, hoveredMesh }) => {
  const floorTexture = useLoader(TextureLoader, '/textures/floor.png');
  const repeatX = width / 2;
  const repeatY = length / 2;

  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(repeatX, repeatY);

  return (
    <>
      {/* Floor */}
      <SelectableObject viewMode={viewMode} onHoverChange={onHoverChange} hoveredMesh={hoveredMesh}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial 
            map={floorTexture} 
            color="white"
            emissive={hoveredMesh && hoveredMesh.type === 'Mesh' && hoveredMesh.geometry.type === 'PlaneGeometry' ? "white" : "black"}
            emissiveIntensity={hoveredMesh && hoveredMesh.type === 'Mesh' && hoveredMesh.geometry.type === 'PlaneGeometry' ? 0.3 : 0}
          />
        </mesh>
      </SelectableObject>

      {/* Wall 1 */}
      <SelectableObject viewMode={viewMode} onHoverChange={onHoverChange} hoveredMesh={hoveredMesh}>
        <mesh position={[-width / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[0.1, height, length]} />
          <meshStandardMaterial 
            color="#F8F8FF"
            emissive={hoveredMesh && hoveredMesh.position?.x === -width / 2 ? "white" : "black"}
            emissiveIntensity={hoveredMesh && hoveredMesh.position?.x === -width / 2 ? 0.3 : 0}
          />
        </mesh>
      </SelectableObject>

      {/* Wall 2 */}
      <SelectableObject viewMode={viewMode} onHoverChange={onHoverChange} hoveredMesh={hoveredMesh}>
        <mesh position={[width / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[0.1, height, length]} />
          <meshStandardMaterial 
            color="#F8F8FF"
            emissive={hoveredMesh && hoveredMesh.position?.x === width / 2 ? "white" : "black"}
            emissiveIntensity={hoveredMesh && hoveredMesh.position?.x === width / 2 ? 0.3 : 0}
          />
        </mesh>
      </SelectableObject>

      {/* Wall 3 */}
      <SelectableObject viewMode={viewMode} onHoverChange={onHoverChange} hoveredMesh={hoveredMesh}>
        <mesh position={[0, height / 2, -length / 2]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.1, height, width]} />
          <meshStandardMaterial 
            color="#F8F8FF"
            emissive={hoveredMesh && hoveredMesh.position?.z === -length / 2 ? "white" : "black"}
            emissiveIntensity={hoveredMesh && hoveredMesh.position?.z === -length / 2 ? 0.3 : 0}
          />
        </mesh>
      </SelectableObject>

      {/* Wall 4 */}
      <SelectableObject viewMode={viewMode} onHoverChange={onHoverChange} hoveredMesh={hoveredMesh}>
        <mesh position={[0, height / 2, length / 2]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.1, height, width]} />
          <meshStandardMaterial 
            color="#F8F8FF"
            emissive={hoveredMesh && hoveredMesh.position?.z === length / 2 ? "white" : "black"}
            emissiveIntensity={hoveredMesh && hoveredMesh.position?.z === length / 2 ? 0.3 : 0}
          />
        </mesh>
      </SelectableObject>
    </>
  );
};

export default RoomStructure;