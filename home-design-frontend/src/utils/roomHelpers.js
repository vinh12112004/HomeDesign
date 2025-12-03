export const getMousePos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
    };
};

export const screenToWorld = (
    canvas,
    clientX,
    clientY,
    offsetX,
    offsetY,
    scale
) => {
    const { x, y } = getMousePos(canvas, { clientX, clientY });
    return { x: (x - offsetX) / scale, z: (y - offsetY) / scale };
};

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

export const constrainToZone = (zone, x, z, roomWidth, roomLength) => {
    if (!zone) return { x, z };
    if (zone.side === "right" || zone.side === "left") {
        return {
            x: zone.fixedX,
            z: Math.max(
                zone.minZ - roomLength / 2 + 1,
                Math.min(zone.maxZ + roomLength / 2 - 1, z)
            ),
        };
    } else {
        return {
            x: Math.max(
                zone.minX - roomWidth / 2 + 1,
                Math.min(zone.maxX + roomWidth / 2 - 1, x)
            ),
            z: zone.fixedZ,
        };
    }
};

export const isPointInValidZone = (validZones, x, z) => {
    return !!findZoneContainingPoint(validZones, x, z);
};

export const isClickOnCenter = (
    canvas,
    newRoomCenter,
    mouseX,
    mouseY,
    scale,
    offsetX,
    offsetY
) => {
    if (!newRoomCenter) return false;
    const rect = canvas.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;
    const centerX = newRoomCenter.x * scale + offsetX;
    const centerY = newRoomCenter.z * scale + offsetY;
    const distance = Math.hypot(x - centerX, y - centerY);
    return distance <= 12;
};
