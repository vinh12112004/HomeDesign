import React, { useEffect } from "react";
import { doRoomsOverlap } from "../../utils/roomCalculations";
import { findZoneContainingPoint } from "../../utils/roomHelpers";

export default function CanvasRenderer({
    canvasRef,
    existingRooms,
    addedRooms,
    newRoomCenter,
    roomWidth,
    roomLength,
    isDragging,
    scale,
    offsetX,
    offsetY,
    validZones,
    showZones,
    selectedRoomId = null, // For MoveRoom mode
    mode = "designer", // "designer" or "move"
}) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        drawGrid(ctx, canvas, scale, offsetX, offsetY);

        // Draw origin axes
        drawOriginAxes(ctx, canvas, offsetX, offsetY);

        // Draw valid zones
        if (showZones && validZones.length > 0) {
            drawValidZones(ctx, validZones, scale, offsetX, offsetY);
        }

        // Draw rooms based on mode
        if (mode === "move") {
            // Move mode: draw all rooms with selection highlight
            existingRooms.forEach((room) => {
                const isSelected = room.id === selectedRoomId;
                drawRoomMove(ctx, room, isSelected, scale, offsetX, offsetY);
            });
        } else {
            // Designer mode: draw existing and added rooms separately
            existingRooms.forEach((r) =>
                drawRoom(
                    ctx,
                    r,
                    "#e3f2fd",
                    "#1976d2",
                    false,
                    false,
                    scale,
                    offsetX,
                    offsetY
                )
            );
            addedRooms.forEach((r) =>
                drawRoom(
                    ctx,
                    r,
                    "#c8e6c9",
                    "#4caf50",
                    false,
                    true,
                    scale,
                    offsetX,
                    offsetY
                )
            );

            // Draw preview room in designer mode
            if (newRoomCenter) {
                drawPreviewRoom(
                    ctx,
                    newRoomCenter,
                    roomWidth,
                    roomLength,
                    existingRooms,
                    addedRooms,
                    validZones,
                    isDragging,
                    scale,
                    offsetX,
                    offsetY
                );
            }

            // Draw center dots for existing rooms
            existingRooms.forEach((room) => {
                drawCenterDot(ctx, room, "#1976d2", scale, offsetX, offsetY);
            });

            // Draw center dots for added rooms
            addedRooms.forEach((room) => {
                drawCenterDot(ctx, room, "#4caf50", scale, offsetX, offsetY);
            });
        }

        // Draw zoom level indicator
        drawZoomIndicator(ctx, scale);
    }, [
        existingRooms,
        addedRooms,
        newRoomCenter,
        roomWidth,
        roomLength,
        isDragging,
        scale,
        offsetX,
        offsetY,
        validZones,
        showZones,
        selectedRoomId,
        mode,
    ]);

    return null; // This component doesn't render anything itself
}

// Helper functions for drawing

function drawGrid(ctx, canvas, scale, offsetX, offsetY) {
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = -offsetX % scale; x <= canvas.width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = -offsetY % scale; y <= canvas.height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawOriginAxes(ctx, canvas, offsetX, offsetY) {
    ctx.strokeStyle = "#9e9e9e";
    ctx.lineWidth = 2;

    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(offsetX, 0);
    ctx.lineTo(offsetX, canvas.height);
    ctx.stroke();

    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(0, offsetY);
    ctx.lineTo(canvas.width, offsetY);
    ctx.stroke();
}

function drawValidZones(ctx, validZones, scale, offsetX, offsetY) {
    validZones.forEach((zone) => {
        const x = zone.x * scale + offsetX - (zone.width * scale) / 2;
        const y = zone.z * scale + offsetY - (zone.length * scale) / 2;
        const width = zone.width * scale;
        const height = zone.length * scale;

        // Fill zone
        ctx.fillStyle = "rgba(76, 175, 80, 0.15)";
        ctx.fillRect(x, y, width, height);

        // Border
        ctx.strokeStyle = "#4caf50";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);

        const centerX = zone.x * scale + offsetX;
        const centerY = zone.z * scale + offsetY;

        // Draw directional indicators
        drawZoneDirectionIndicator(
            ctx,
            zone,
            x,
            y,
            width,
            height,
            centerX,
            centerY
        );

        // Draw side label
        ctx.fillStyle = "#4caf50";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        const sideLabel = {
            right: "→",
            left: "←",
            top: "↑",
            bottom: "↓",
        }[zone.side];
        ctx.fillText(sideLabel, centerX, centerY + 4);
    });
}

function drawZoneDirectionIndicator(
    ctx,
    zone,
    x,
    y,
    width,
    height,
    centerX,
    centerY
) {
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = 2;

    if (zone.side === "right" || zone.side === "left") {
        // Vertical arrow
        ctx.beginPath();
        ctx.moveTo(centerX, y + 10);
        ctx.lineTo(centerX, y + height - 10);
        ctx.stroke();

        // Top arrow head
        ctx.beginPath();
        ctx.moveTo(centerX, y + 10);
        ctx.lineTo(centerX - 5, y + 15);
        ctx.moveTo(centerX, y + 10);
        ctx.lineTo(centerX + 5, y + 15);
        ctx.stroke();

        // Bottom arrow head
        ctx.beginPath();
        ctx.moveTo(centerX, y + height - 10);
        ctx.lineTo(centerX - 5, y + height - 15);
        ctx.moveTo(centerX, y + height - 10);
        ctx.lineTo(centerX + 5, y + height - 15);
        ctx.stroke();
    } else {
        // Horizontal arrow
        ctx.beginPath();
        ctx.moveTo(x + 10, centerY);
        ctx.lineTo(x + width - 10, centerY);
        ctx.stroke();

        // Left arrow head
        ctx.beginPath();
        ctx.moveTo(x + 10, centerY);
        ctx.lineTo(x + 15, centerY - 5);
        ctx.moveTo(x + 10, centerY);
        ctx.lineTo(x + 15, centerY + 5);
        ctx.stroke();

        // Right arrow head
        ctx.beginPath();
        ctx.moveTo(x + width - 10, centerY);
        ctx.lineTo(x + width - 15, centerY - 5);
        ctx.moveTo(x + width - 10, centerY);
        ctx.lineTo(x + width - 15, centerY + 5);
        ctx.stroke();
    }
}

function drawRoom(
    ctx,
    room,
    fillColor,
    borderColor,
    isDashed,
    showCenter,
    scale,
    offsetX,
    offsetY
) {
    const x = room.x * scale + offsetX - (room.width * scale) / 2;
    const y = room.z * scale + offsetY - (room.length * scale) / 2;
    const width = room.width * scale;
    const height = room.length * scale;

    // Fill
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = isDashed ? 2 : 4;
    if (isDashed) ctx.setLineDash([10, 5]);
    else ctx.setLineDash([]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);

    // Dimensions label
    ctx.fillStyle = "#424242";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        `${room.width}m × ${room.length}m`,
        room.x * scale + offsetX,
        room.z * scale + offsetY - 5
    );

    // Center coordinates label
    if (showCenter) {
        ctx.fillStyle = "#f44336";
        ctx.font = "bold 12px Arial";
        ctx.fillText(
            `Tâm: (${room.x.toFixed(2)}, ${room.z.toFixed(2)})`,
            room.x * scale + offsetX,
            room.z * scale + offsetY + 15
        );
    }
}

// For MoveRoom mode
function drawRoomMove(ctx, room, isSelected, scale, offsetX, offsetY) {
    const x = room.x * scale + offsetX - (room.width * scale) / 2;
    const y = room.z * scale + offsetY - (room.length * scale) / 2;
    const width = room.width * scale;
    const height = room.length * scale;

    // Fill
    ctx.fillStyle = isSelected
        ? "rgba(255, 193, 7, 0.4)"
        : "rgba(33, 150, 243, 0.3)";
    ctx.fillRect(x, y, width, height);

    // Border
    ctx.strokeStyle = isSelected ? "#ff9800" : "#2196f3";
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeRect(x, y, width, height);

    // Room dimensions
    ctx.fillStyle = "#424242";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        `${room.width}m × ${room.length}m`,
        room.x * scale + offsetX,
        room.z * scale + offsetY - 5
    );

    // Room center point
    const centerX = room.x * scale + offsetX;
    const centerY = room.z * scale + offsetY;
    ctx.fillStyle = isSelected ? "#ff9800" : "#2196f3";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Coordinates for selected room
    if (isSelected) {
        ctx.fillStyle = "#ff9800";
        ctx.font = "bold 11px Arial";
        ctx.fillText(
            `(${room.x.toFixed(2)}, ${room.z.toFixed(2)})`,
            centerX,
            centerY + 20
        );
    }
}

function drawPreviewRoom(
    ctx,
    newRoomCenter,
    roomWidth,
    roomLength,
    existingRooms,
    addedRooms,
    validZones,
    isDragging,
    scale,
    offsetX,
    offsetY
) {
    const previewRoom = {
        x: newRoomCenter.x,
        z: newRoomCenter.z,
        width: roomWidth,
        length: roomLength,
    };

    // Check validity
    const inValidZone = !!findZoneContainingPoint(
        validZones,
        newRoomCenter.x,
        newRoomCenter.z
    );
    const allRooms = [...existingRooms, ...addedRooms];
    const overlaps = allRooms.some((r) => doRoomsOverlap(previewRoom, r));
    const valid = inValidZone && !overlaps;

    // Draw room
    const color = valid ? "rgba(255,193,7,0.4)" : "rgba(244,67,54,0.4)";
    const borderColor = valid ? "#ffc107" : "#f44336";
    drawRoom(
        ctx,
        previewRoom,
        color,
        borderColor,
        true,
        true,
        scale,
        offsetX,
        offsetY
    );

    // Draw center marker
    const centerX = newRoomCenter.x * scale + offsetX;
    const centerY = newRoomCenter.z * scale + offsetY;

    // Outer circle
    ctx.fillStyle = isDragging ? "rgba(255,193,7,0.4)" : "rgba(255,193,7,0.3)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle
    ctx.fillStyle = isDragging ? "#ff9800" : "#ffc107";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Circle border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 4, centerY);
    ctx.lineTo(centerX + 4, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 4);
    ctx.lineTo(centerX, centerY + 4);
    ctx.stroke();

    // Coordinate label
    const coordText = `(${newRoomCenter.x.toFixed(
        2
    )}, ${newRoomCenter.z.toFixed(2)})`;
    ctx.font = "bold 12px Arial";
    const textWidth = ctx.measureText(coordText).width;
    const labelX = centerX;
    const labelY = centerY - 25;

    ctx.fillStyle = "rgba(255,193,7,0.95)";
    ctx.fillRect(labelX - textWidth / 2 - 5, labelY - 12, textWidth + 10, 18);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(coordText, labelX, labelY + 2);
}

function drawCenterDot(ctx, room, color, scale, offsetX, offsetY) {
    const centerX = room.x * scale + offsetX;
    const centerY = room.z * scale + offsetY;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawZoomIndicator(ctx, scale) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Zoom: ${Math.round((scale / 80) * 100)}%`, 10, 20);
}
