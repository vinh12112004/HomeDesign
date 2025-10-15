import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import SelectableObject from './SelectableObject';

const ObjectRenderer = ({ objectData, viewMode, onHoverChange, hoveredMesh }) => {
  const { 
    id,
    type,
    assetKey,
    positionJson,
    rotationJson,
    scaleJson,
    metadataJson
  } = objectData;

  // Parse JSON data
  const position = useMemo(() => {
    const pos = JSON.parse(positionJson);
    return [pos.x, pos.y, pos.z];
  }, [positionJson]);

  const rotation = useMemo(() => {
    const rot = JSON.parse(rotationJson);
    return [rot.x, rot.y, rot.z];
  }, [rotationJson]);

  const scale = useMemo(() => {
    const sc = JSON.parse(scaleJson);
    return [sc.x, sc.y, sc.z];
  }, [scaleJson]);

  const metadata = useMemo(() => {
    return JSON.parse(metadataJson);
  }, [metadataJson]);

  // Load texture nếu có
  const texture = metadata.texture ? useLoader(TextureLoader, metadata.texture) : null;

  // Setup texture properties cho floor
  const configuredTexture = useMemo(() => {
    if (!texture) return null;
    
    const tex = texture.clone();
    if (type === 'Floor') {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      // Repeat texture dựa trên kích thước floor
      const repeatX = metadata.width / 2;
      const repeatY = metadata.length / 2;
      tex.repeat.set(repeatX, repeatY);
    }
    return tex;
  }, [texture, type, metadata]);

  // Tính toán material properties
  const materialProps = useMemo(() => {
    const isHovered = hoveredMesh && hoveredMesh.userData?.objectId === id;
    
    return {
      color: type === 'Floor' ? '#FFFFFF' : '#F8F8FF',
      roughness: 0.8,
      metalness: 0.1,
      map: configuredTexture,
      emissive: isHovered ? "white" : "black",
      emissiveIntensity: isHovered ? 0.3 : 0
    };
  }, [type, configuredTexture, hoveredMesh, id]);

  // Render geometry dựa trên assetKey và metadata
  const renderGeometry = () => {
    if (assetKey === 'procedural/plane') {
      return <planeGeometry args={[metadata.width, metadata.length]} />;
    } else if (assetKey === 'procedural/box') {
      return <boxGeometry args={[metadata.sizeX, metadata.sizeY, metadata.sizeZ]} />;
    }
    
    // Default fallback
    return <boxGeometry args={[1, 1, 1]} />;
  };

  const shouldCastShadow = type !== 'Floor';
  const shouldReceiveShadow = type === 'Floor';

  return (
    <SelectableObject viewMode={viewMode} onHoverChange={onHoverChange}>
      <mesh 
        position={position} 
        rotation={rotation} 
        scale={scale}
        castShadow={shouldCastShadow}
        receiveShadow={shouldReceiveShadow}
        userData={{ objectId: id, objectType: type, assetKey: assetKey }}
      >
        {renderGeometry()}
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </SelectableObject>
  );
};

export default ObjectRenderer;