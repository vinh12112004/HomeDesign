import React, { useMemo, useEffect } from 'react';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import SelectableObject from './SelectableObject';
import { useSelector } from 'react-redux';
import { useLoader } from '@react-three/fiber';
import OBJModel from './OBJModel';

const ObjectRenderer = ({ objectData }) => {
  const {
    id,
    type,
    assetKey,
    positionJson,
    rotationJson,
    scaleJson,
    metadataJson,
  } = objectData;

  const { hoveredMesh, selectedMesh } = useSelector((state) => state.ui);

  const position = useMemo(() => {
    try {
      const pos = JSON.parse(positionJson);
      return [pos.x ?? 0, pos.y ?? 0, pos.z ?? 0];
    } catch {
      return [0, 0, 0];
    }
  }, [positionJson]);

  const rotation = useMemo(() => {
    try {
      const rot = JSON.parse(rotationJson);
      return [rot.x ?? 0, rot.y ?? 0, rot.z ?? 0];
    } catch {
      return [0, 0, 0];
    }
  }, [rotationJson]);

  const scale = useMemo(() => {
    try {
      const sc = JSON.parse(scaleJson);
      return [sc.x ?? 1, sc.y ?? 1, sc.z ?? 1];
    } catch {
      return [1, 1, 1];
    }
  }, [scaleJson]);

  const metadata = useMemo(() => {
    try {
      return JSON.parse(metadataJson) || {};
    } catch {
      return {};
    }
  }, [metadataJson]);

  // Texture (nếu có)
  const texture = metadata?.texture
  ? useLoader(TextureLoader, metadata.texture)
  : null;

  // Lặp texture cho Floor/Wall
  const configuredTexture = useMemo(() => {
    if (!texture) return null;
    const tex = texture.clone();

    if (type === 'Floor') {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      const repeatX = (metadata.width ?? 1) / 2;
      const repeatY = (metadata.length ?? 1) / 2;
      tex.repeat.set(repeatX, repeatY);
    }

    if (type === 'Wall') {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      const repeatX = metadata.sizeZ ?? 1; // ngang tường
      const repeatY = metadata.sizeY ?? 1; // cao tường
      tex.repeat.set(repeatX, repeatY);
    }

    return tex;
  }, [texture, type, metadata]);

  // Highlight hover/selected
  const materialProps = useMemo(() => {
    const isHovered = hoveredMesh === id;
    const isSelected = selectedMesh === id;
    const baseColor = metadata.color ?? '#cccccc';

    let emissiveColor = '#000000';
    let emissiveIntensity = 0;

    if (isSelected) {
      emissiveColor = '#0066ff';
      emissiveIntensity = 0.3;
    } else if (isHovered) {
      // emissiveColor = '#ffff00';
      // emissiveIntensity = 0.2;
    }

    return {
      color: baseColor,
      roughness: 0.8,
      metalness: 0.1,
      map: configuredTexture,
      emissive: emissiveColor,
      emissiveIntensity,
    };
  }, [configuredTexture, hoveredMesh, selectedMesh, id, metadata?.color]);

  // Quan trọng: chỉ load OBJ khi có URL
  const shouldLoadOBJ = assetKey === 'model/obj' && !!metadata?.objPath;

  const renderGeometry = () => {
    if (assetKey === 'procedural/plane') {
      return <planeGeometry args={[metadata.width ?? 1, metadata.length ?? 1]} />;
    }
    if (assetKey === 'procedural/box') {
      return (
        <boxGeometry
          args={[metadata.sizeX ?? 1, metadata.sizeY ?? 1, metadata.sizeZ ?? 1]}
        />
      );
    }
    return <boxGeometry args={[1, 1, 1]} />;
  };

  const shouldCastShadow = type !== 'Floor';
  const shouldReceiveShadow = type === 'Floor';

  return (
    <SelectableObject>
      {shouldLoadOBJ ? (
        <OBJModel
          objPath={metadata.objPath}
          mtlPath={metadata.mtlPath}
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow={shouldCastShadow}
          receiveShadow={shouldReceiveShadow}
          userData={{ objectId: id, objectType: type, assetKey }}
        />
      ) : (
        <mesh
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow={shouldCastShadow}
          receiveShadow={shouldReceiveShadow}
          userData={{ objectId: id, objectType: type, assetKey }}
        >
          {renderGeometry()}
          {/* Chỉ gắn material cho procedural/default, KHÔNG gắn cho model/glb */}
          <meshStandardMaterial {...materialProps} />
        </mesh>
      )}
    </SelectableObject>
  );
};

export default ObjectRenderer;