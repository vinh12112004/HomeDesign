import { CSG } from "three-csg-ts";
import * as THREE from "three";

/**
 * Cắt phần tường bị giao với vật thể khác
 * @param {THREE.Mesh} wallMesh - Mesh tường
 * @param {THREE.Mesh} cutterMesh - Mesh vật thể (ví dụ cửa, cửa sổ)
 * @returns {THREE.Mesh} - Mesh tường sau khi bị cắt
 */
export const cutWallByObject = (wallMesh, cutterMesh) => {
    if (!wallMesh || !cutterMesh) return wallMesh;

    try {
        const wallCSG = CSG.fromMesh(wallMesh);
        const cutterCSG = CSG.fromMesh(cutterMesh);

        // Trừ phần giao nhau
        const subtractedCSG = wallCSG.subtract(cutterCSG);
        const newWall = CSG.toMesh(
            subtractedCSG,
            wallMesh.matrix,
            wallMesh.material
        );

        newWall.position.copy(wallMesh.position);
        newWall.rotation.copy(wallMesh.rotation);
        newWall.scale.copy(wallMesh.scale);

        return newWall;
    } catch (err) {
        console.error("CSG error:", err);
        return wallMesh;
    }
};
