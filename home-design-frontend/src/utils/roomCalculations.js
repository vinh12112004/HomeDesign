/**
 * Check if two rooms overlap
 */
export const doRoomsOverlap = (r1, r2) => {
    const r1Left = r1.x - r1.width / 2;
    const r1Right = r1.x + r1.width / 2;
    const r1Top = r1.z - r1.length / 2;
    const r1Bottom = r1.z + r1.length / 2;

    const r2Left = r2.x - r2.width / 2;
    const r2Right = r2.x + r2.width / 2;
    const r2Top = r2.z - r2.length / 2;
    const r2Bottom = r2.z + r2.length / 2;


    return !(
        r1Right <= r2Left||
        r1Left >= r2Right ||
        r1Bottom <= r2Top ||
        r1Top >= r2Bottom
    );
};

/**
 * Calculate valid zones for placing new rooms
 */
export const calculateValidZones = (
    existingRooms,
    addedRooms,
    roomWidth,
    roomLength
) => {
    const allRooms = [...existingRooms, ...addedRooms];
    const zones = [];
    const newWidth = roomWidth;
    const newLength = roomLength;

    allRooms.forEach((room) => {
        const rightZoneLength = Math.max(room.length, newLength);
        zones.push({
            x: room.x + room.width / 2 + newWidth / 2,
            z: room.z,
            width: newWidth,
            length: rightZoneLength + newLength * 2 - 2,
            side: "right",
            adjacentRoom: room,
            minZ: room.z - rightZoneLength / 2,
            maxZ: room.z + rightZoneLength / 2,
            fixedX: room.x + room.width / 2 + newWidth / 2,
        });

        const leftZoneLength = Math.max(room.length, newLength);
        zones.push({
            x: room.x - room.width / 2 - newWidth / 2,
            z: room.z,
            width: newWidth,
            length: leftZoneLength + newLength * 2 - 2,
            side: "left",
            adjacentRoom: room,
            minZ: room.z - leftZoneLength / 2,
            maxZ: room.z + leftZoneLength / 2,
            fixedX: room.x - room.width / 2 - newWidth / 2,
        });

        const topZoneWidth = Math.max(room.width, newWidth);
        zones.push({
            x: room.x,
            z: room.z - room.length / 2 - newLength / 2,
            width: topZoneWidth + newWidth * 2 - 2,
            length: newLength,
            side: "top",
            adjacentRoom: room,
            minX: room.x - topZoneWidth / 2,
            maxX: room.x + topZoneWidth / 2,
            fixedZ: room.z - room.length / 2 - newLength / 2,
        });

        const bottomZoneWidth = Math.max(room.width, newWidth);
        zones.push({
            x: room.x,
            z: room.z + room.length / 2 + newLength / 2,
            width: bottomZoneWidth + newWidth * 2 - 2,
            length: newLength,
            side: "bottom",
            adjacentRoom: room,
            minX: room.x - bottomZoneWidth / 2,
            maxX: room.x + bottomZoneWidth / 2,
            fixedZ: room.z + room.length / 2 + newLength / 2,
        });
    });

    // const valid = zones.filter((zone) => {
    //     return !allRooms.some((room) => doRoomsOverlap(zone, room));
    // });

    return zones;
};

/**
 * Find zone containing a point
 */
export const findZoneContainingPoint = (validZones, x, z) => {
    return validZones.find((zone) => {
        const halfW = zone.width / 2;
        const halfL = zone.length / 2;
        return (
            x >= zone.x - halfW &&
            x <= zone.x + halfW &&
            z >= zone.z - halfL &&
            z <= zone.z + halfL
        );
    });
};

/**
 * Constrain position to zone
 */
export const constrainToZone = (zone, x, z, roomWidth, roomLength) => {
    if (!zone) return { x, z };
    if (zone.side === "right" || zone.side === "left") {
        return {
            x: zone.fixedX,
            z: Math.max(
                zone.minZ + roomLength / 2,
                Math.min(zone.maxZ - roomLength / 2, z)
            ),
        };
    } else {
        return {
            x: Math.max(
                zone.minX + roomWidth / 2,
                Math.min(zone.maxX - roomWidth / 2, x)
            ),
            z: zone.fixedZ,
        };
    }
};

/**
 * Convert screen coordinates to world coordinates
 */
export const screenToWorld = (
    screenX,
    screenY,
    canvasRect,
    offsetX,
    offsetY,
    scale
) => {
    const x = screenX - canvasRect.left;
    const y = screenY - canvasRect.top;
    return { x: (x - offsetX) / scale, z: (y - offsetY) / scale };
};

/**
 * Check if click is on center point
 */
export const isClickOnCenter = (
    mouseX,
    mouseY,
    newRoomCenter,
    canvasRect,
    offsetX,
    offsetY,
    scale
) => {
    if (!newRoomCenter) return false;
    const x = mouseX - canvasRect.left;
    const y = mouseY - canvasRect.top;
    const centerX = newRoomCenter.x * scale + offsetX;
    const centerY = newRoomCenter.z * scale + offsetY;
    const distance = Math.hypot(x - centerX, y - centerY);
    return distance <= 12;
};
