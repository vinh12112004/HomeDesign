import React, { useMemo, useRef } from "react";
import { TextureLoader } from "three";
import * as THREE from "three";
import SelectableObject from "./SelectableObject";
import { useSelector } from "react-redux";
import { useLoader } from "@react-three/fiber";
import OBJModel from "./OBJModel";
import { useThree } from "@react-three/fiber";
import { CSG } from "three-csg-ts";

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

    const meshRef = useRef();
    const { scene } = useThree();

    const { hoveredMesh, selectedMesh } = useSelector((state) => state.ui);

    const position = useMemo(() => {
        try {
            const pos = JSON.parse(positionJson);
            return [pos.x ?? 0, pos.y ?? 0, pos.z ?? 0];
        } catch {
            return [0, 0, 0];
        }
    }, [positionJson]);
    position[1];

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

        if (type === "Floor") {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            const repeatX = (metadata.width ?? 1) / 2;
            const repeatY = (metadata.length ?? 1) / 2;
            tex.repeat.set(repeatX, repeatY);
        }

        if (type === "Wall") {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            const repeatX = metadata.sizeZ ?? 1;
            const repeatY = metadata.sizeY ?? 1;
            tex.repeat.set(repeatX, repeatY);
        }

        return tex;
    }, [texture, type, metadata]);

    // Highlight hover/selected
    const materialProps = useMemo(() => {
        const isHovered = hoveredMesh === id;
        const isSelected = selectedMesh === id;
        const baseColor = metadata.color ?? "#cccccc";

        let emissiveColor = "#000000";
        let emissiveIntensity = 0;

        if (isSelected) {
            emissiveColor = "#0066ff";
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

    const shouldLoadOBJ = assetKey === "model/obj" && !!metadata?.objPath;

    // Tạo geometry với CSG nếu có holes
    const geometry = useMemo(() => {
        if (assetKey === "procedural/plane") {
            return new THREE.PlaneGeometry(
                metadata.width ?? 1,
                metadata.length ?? 1
            );
        }

        if (assetKey === "procedural/box") {
            const sizeX = metadata.sizeX ?? 1;
            const sizeY = metadata.sizeY ?? 1;
            const sizeZ = metadata.sizeZ ?? 1;

            // Tạo box chính
            const mainGeometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);

            // Kiểm tra nếu có holes
            if (
                metadata.holes &&
                Array.isArray(metadata.holes) &&
                metadata.holes.length > 0
            ) {
                // Tạo mesh từ geometry chính
                const mainMesh = new THREE.Mesh(
                    mainGeometry,
                    new THREE.MeshStandardMaterial()
                );

                // Áp dụng CSG để subtract holes
                let resultCSG = CSG.fromMesh(mainMesh);

                metadata.holes.forEach((hole) => {
                    const holeWidth = hole.width;
                    const holeHeight = hole.height;
                    const holeDepth = hole.depth;

                    // Tạo box cho hole
                    const holeGeometry = new THREE.BoxGeometry(
                        holeDepth,
                        holeHeight,
                        holeWidth
                    );

                    const holeMesh = new THREE.Mesh(
                        holeGeometry,
                        new THREE.MeshStandardMaterial()
                    );

                    // Đặt vị trí của hole theo center
                    if (hole.center) {
                        holeMesh.position.set(
                            hole.center.x ?? 0,
                            hole.center.y ?? 0, // vị trí thực sẽ phải + thêm position của main mesh
                            hole.center.z ?? 0
                        );
                    }
                    console.log(
                        "Hole Mesh Position:",
                        holeMesh.position,
                        position[1]
                    );

                    holeMesh.updateMatrix();

                    // Subtract hole từ main mesh
                    const holeCSG = CSG.fromMesh(holeMesh);
                    resultCSG = resultCSG.subtract(holeCSG);
                });

                // Chuyển CSG result về geometry
                const resultMesh = CSG.toMesh(resultCSG, mainMesh.matrix);
                return resultMesh.geometry;
            }

            return mainGeometry;
        }

        return new THREE.BoxGeometry(1, 1, 1);
    }, [assetKey, metadata]);

    const shouldCastShadow = type !== "Floor";
    const shouldReceiveShadow = type === "Floor";

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
                    uuid={id}
                    ref={meshRef}
                    position={position}
                    rotation={rotation}
                    scale={scale}
                    castShadow={shouldCastShadow}
                    receiveShadow={shouldReceiveShadow}
                    userData={{ objectId: id, objectType: type, assetKey }}
                    geometry={geometry}
                >
                    <meshStandardMaterial {...materialProps} />
                </mesh>
            )}
        </SelectableObject>
    );
};

export default ObjectRenderer;
