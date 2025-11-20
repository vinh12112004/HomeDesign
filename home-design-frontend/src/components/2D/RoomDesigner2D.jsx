import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeRoomDesigner2D } from "../../store/slices/uiSlice";
import { addRoom } from "../../store/slices/projectSlice";
import { fetchObjects } from "../../store/slices/objectSlice";
import {
    Layout,
    Card,
    InputNumber,
    Button,
    List,
    Typography,
    Divider,
    message,
    Spin,
} from "antd";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function RoomDesigner2D() {
    const dispatch = useDispatch();

    const canvasRef = useRef(null);

    // core settings
    const [scale, setScale] = useState(80); // 1 meter = 80 pixels
    const [offsetX, setOffsetX] = useState(600);
    const [offsetY, setOffsetY] = useState(400);

    // room dimension inputs
    const [roomWidth, setRoomWidth] = useState(4);
    const [roomLength, setRoomLength] = useState(5);

    // ui state
    const [newRoomCenter, setNewRoomCenter] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [addedRooms, setAddedRooms] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [status, setStatus] = useState("Nhấp hoặc kéo để đặt tâm phòng mới");
    const [validZones, setValidZones] = useState([]);
    const [showZones] = useState(true); // Always show zones, no toggle
    const [currentZone, setCurrentZone] = useState(null);

    // pan state
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    // data
    const objects = useSelector((state) => state.objects.objects);
    const currentProject = useSelector(
        (state) => state.projects.currentProject
    );
    const isAddingRoom = useSelector((state) => state.projects.isAddingRoom);

    const existingRooms = objects
        .filter((it) => it.type === "Floor")
        .map((floor) => {
            const pos = JSON.parse(floor.positionJson);
            const meta = JSON.parse(floor.metadataJson);
            return {
                x: pos.x,
                z: pos.z,
                width: meta.width,
                length: meta.length,
                id: floor.id,
            };
        });

    // overlap check
    const doRoomsOverlap = (r1, r2) => {
        const r1Left = r1.x - r1.width / 2;
        const r1Right = r1.x + r1.width / 2;
        const r1Top = r1.z - r1.length / 2;
        const r1Bottom = r1.z + r1.length / 2;

        const r2Left = r2.x - r2.width / 2;
        const r2Right = r2.x + r2.width / 2;
        const r2Top = r2.z - r2.length / 2;
        const r2Bottom = r2.z + r2.length / 2;

        const threshold = 0.001;

        return !true;
    };

    // calculate valid zones
    const calculateValidZones = () => {
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

        const valid = zones.filter((zone) => {
            return !allRooms.some((room) => doRoomsOverlap(zone, room));
        });

        return valid;
    };

    useEffect(() => {
        setValidZones(calculateValidZones());
    }, [roomWidth, roomLength, addedRooms]);

    const findZoneContainingPoint = (x, z) => {
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

    const constrainToZone = (zone, x, z) => {
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

    const isPointInValidZone = (x, z) => !!findZoneContainingPoint(x, z);
    // trả về toạ độ trong mặt 2d dựa trên toạ độ trỏ chuột trên màn hình
    const screenToWorld = (screenX, screenY) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = screenX - rect.left;
        const y = screenY - rect.top;
        return { x: (x - offsetX) / scale, z: (y - offsetY) / scale };
    };

    const isClickOnCenter = (mouseX, mouseY) => {
        if (!newRoomCenter) return false;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;
        const centerX = newRoomCenter.x * scale + offsetX;
        const centerY = newRoomCenter.z * scale + offsetY;
        const distance = Math.hypot(x - centerX, y - centerY);
        return distance <= 12;
    };

    // Keyboard event handlers for Space key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "Space" && !isSpacePressed) {
                e.preventDefault();
                setIsSpacePressed(true);
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                setIsSpacePressed(false);
                setIsPanning(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isSpacePressed]);

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // If space is pressed, start panning
        if (isSpacePressed) {
            setIsPanning(true);
            setPanStart({ x: mouseX, y: mouseY });
            canvas.style.cursor = "grabbing";
            return;
        }

        const worldPos = screenToWorld(e.clientX, e.clientY);

        if (isClickOnCenter(e.clientX, e.clientY)) {
            const zone = findZoneContainingPoint(
                newRoomCenter.x,
                newRoomCenter.z
            );
            setCurrentZone(zone);
            setIsDragging(true);
            canvas.style.cursor = "grabbing";
        } else if (isPointInValidZone(worldPos.x, worldPos.z)) {
            const zone = findZoneContainingPoint(worldPos.x, worldPos.z);
            if (zone) {
                const constrainedPos = constrainToZone(
                    zone,
                    worldPos.x,
                    worldPos.z
                );
                setNewRoomCenter(constrainedPos);
                setCurrentZone(zone);
                setIsDragging(true);
                canvas.style.cursor = "grabbing";
            }
        }
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Handle panning
        if (isPanning) {
            const dx = mouseX - panStart.x;
            const dy = mouseY - panStart.y;
            setOffsetX(offsetX + dx);
            setOffsetY(offsetY + dy);
            setPanStart({ x: mouseX, y: mouseY });
            return;
        }

        const worldPos = screenToWorld(e.clientX, e.clientY);

        if (isDragging && newRoomCenter && currentZone) {
            const constrainedPos = constrainToZone(
                currentZone,
                worldPos.x,
                worldPos.z
            );
            const previewRoom = {
                x: constrainedPos.x,
                z: constrainedPos.z,
                width: roomWidth,
                length: roomLength,
            };
            const allRooms = [...existingRooms, ...addedRooms];
            const wouldOverlap = allRooms.some((r) =>
                doRoomsOverlap(previewRoom, r)
            );
            if (!wouldOverlap) setNewRoomCenter(constrainedPos);
        } else {
            // Update cursor based on state
            if (isSpacePressed) {
                canvas.style.cursor = "grab";
            } else if (newRoomCenter && isClickOnCenter(e.clientX, e.clientY)) {
                canvas.style.cursor = "grab";
            } else if (isPointInValidZone(worldPos.x, worldPos.z)) {
                canvas.style.cursor = "pointer";
            } else {
                canvas.style.cursor = "not-allowed";
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsPanning(false);
        setCurrentZone(null);
        const canvas = canvasRef.current;
        if (canvas) {
            if (isSpacePressed) {
                canvas.style.cursor = "grab";
            } else if (newRoomCenter) {
                canvas.style.cursor = "grab";
            }
        }
    };

    // Handle mouse wheel for zoom
    const handleWheel = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Get world position before zoom
        const worldX = (mouseX - offsetX) / scale;
        const worldY = (mouseY - offsetY) / scale;

        // Calculate new scale
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(20, Math.min(200, scale * delta));

        // Calculate new offsets to keep mouse position fixed
        const newOffsetX = mouseX - worldX * newScale;
        const newOffsetY = mouseY - worldY * newScale;

        setScale(newScale);
        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);
    };

    useEffect(() => {
        if (newRoomCenter) {
            const previewRoom = {
                x: newRoomCenter.x,
                z: newRoomCenter.z,
                width: roomWidth,
                length: roomLength,
            };
            const inValidZone = isPointInValidZone(
                newRoomCenter.x,
                newRoomCenter.z
            );
            const allRooms = [...existingRooms, ...addedRooms];
            const overlaps = allRooms.some((r) =>
                doRoomsOverlap(previewRoom, r)
            );
            const valid = inValidZone && !overlaps;
            setIsValid(valid);
            if (valid)
                setStatus('✅ Vị trí hợp lệ - Nhấn "Thêm Phòng" để xác nhận');
            else if (!inValidZone)
                setStatus("❌ Chỉ có thể đặt phòng ở vùng xanh lá cây");
            else setStatus("❌ Vị trí bị trùng với phòng khác");
        } else {
            setIsValid(false);
            setStatus(
                "Nhấp vào vùng xanh lá để đặt phòng mới | Giữ SPACE + kéo chuột để di chuyển view"
            );
        }
    }, [newRoomCenter, roomWidth, roomLength, validZones, addedRooms]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // grid
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // origin axes
        ctx.strokeStyle = "#9e9e9e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(offsetX, 0);
        ctx.lineTo(offsetX, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, offsetY);
        ctx.lineTo(canvas.width, offsetY);
        ctx.stroke();

        // draw valid zones
        if (showZones) {
            validZones.forEach((zone) => {
                const x = zone.x * scale + offsetX - (zone.width * scale) / 2;
                const y = zone.z * scale + offsetY - (zone.length * scale) / 2;
                const width = zone.width * scale;
                const height = zone.length * scale;

                ctx.fillStyle = "rgba(76, 175, 80, 0.15)";
                ctx.fillRect(x, y, width, height);

                ctx.strokeStyle = "#4caf50";
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 4]);
                ctx.strokeRect(x, y, width, height);
                ctx.setLineDash([]);

                const centerX = zone.x * scale + offsetX;
                const centerY = zone.z * scale + offsetY;

                ctx.strokeStyle = "#4caf50";
                ctx.lineWidth = 2;

                if (zone.side === "right" || zone.side === "left") {
                    ctx.beginPath();
                    ctx.moveTo(centerX, y + 10);
                    ctx.lineTo(centerX, y + height - 10);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(centerX, y + 10);
                    ctx.lineTo(centerX - 5, y + 15);
                    ctx.moveTo(centerX, y + 10);
                    ctx.lineTo(centerX + 5, y + 15);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(centerX, y + height - 10);
                    ctx.lineTo(centerX - 5, y + height - 15);
                    ctx.moveTo(centerX, y + height - 10);
                    ctx.lineTo(centerX + 5, y + height - 15);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(x + 10, centerY);
                    ctx.lineTo(x + width - 10, centerY);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x + 10, centerY);
                    ctx.lineTo(x + 15, centerY - 5);
                    ctx.moveTo(x + 10, centerY);
                    ctx.lineTo(x + 15, centerY + 5);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x + width - 10, centerY);
                    ctx.lineTo(x + width - 15, centerY - 5);
                    ctx.moveTo(x + width - 10, centerY);
                    ctx.lineTo(x + width - 15, centerY + 5);
                    ctx.stroke();
                }

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

        const drawRoom = (
            room,
            fillColor,
            borderColor,
            isDashed = false,
            showCenter = false
        ) => {
            const x = room.x * scale + offsetX - (room.width * scale) / 2;
            const y = room.z * scale + offsetY - (room.length * scale) / 2;
            const width = room.width * scale;
            const height = room.length * scale;

            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, width, height);

            ctx.strokeStyle = borderColor;
            ctx.lineWidth = isDashed ? 2 : 4;
            if (isDashed) ctx.setLineDash([10, 5]);
            else ctx.setLineDash([]);
            ctx.strokeRect(x, y, width, height);
            ctx.setLineDash([]);

            ctx.fillStyle = "#424242";
            ctx.font = "bold 13px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                `${room.width}m × ${room.length}m`,
                room.x * scale + offsetX,
                room.z * scale + offsetY - 5
            );

            if (showCenter) {
                ctx.fillStyle = "#f44336";
                ctx.font = "bold 12px Arial";
                ctx.fillText(
                    `Tâm: (${room.x.toFixed(2)}, ${room.z.toFixed(2)})`,
                    room.x * scale + offsetX,
                    room.z * scale + offsetY + 15
                );
            }
        };

        existingRooms.forEach((r) =>
            drawRoom(r, "#e3f2fd", "#1976d2", false, false)
        );
        addedRooms.forEach((r) =>
            drawRoom(r, "#c8e6c9", "#4caf50", false, true)
        );

        if (newRoomCenter) {
            const previewRoom = {
                x: newRoomCenter.x,
                z: newRoomCenter.z,
                width: roomWidth,
                length: roomLength,
            };
            const inValidZone = isPointInValidZone(
                newRoomCenter.x,
                newRoomCenter.z
            );
            const allRooms = [...existingRooms, ...addedRooms];
            const overlaps = allRooms.some((r) =>
                doRoomsOverlap(previewRoom, r)
            );
            const valid = inValidZone && !overlaps;

            const color = valid ? "rgba(255,193,7,0.4)" : "rgba(244,67,54,0.4)";
            const borderColor = valid ? "#ffc107" : "#f44336";
            drawRoom(previewRoom, color, borderColor, true, true);

            const centerX = newRoomCenter.x * scale + offsetX;
            const centerY = newRoomCenter.z * scale + offsetY;

            ctx.fillStyle = isDragging
                ? "rgba(255,193,7,0.4)"
                : "rgba(255,193,7,0.3)";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = isDragging ? "#ff9800" : "#ffc107";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.stroke();

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

            const coordText = `(${newRoomCenter.x.toFixed(
                2
            )}, ${newRoomCenter.z.toFixed(2)})`;
            ctx.font = "bold 12px Arial";
            const textWidth = ctx.measureText(coordText).width;
            const labelX = centerX;
            const labelY = centerY - 25;

            ctx.fillStyle = "rgba(255,193,7,0.95)";
            ctx.fillRect(
                labelX - textWidth / 2 - 5,
                labelY - 12,
                textWidth + 10,
                18
            );
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(coordText, labelX, labelY + 2);
        }

        existingRooms.forEach((room) => {
            const centerX = room.x * scale + offsetX;
            const centerY = room.z * scale + offsetY;
            ctx.fillStyle = "#1976d2";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        addedRooms.forEach((room) => {
            const centerX = room.x * scale + offsetX;
            const centerY = room.z * scale + offsetY;
            ctx.fillStyle = "#4caf50";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw zoom level indicator
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Zoom: ${Math.round((scale / 80) * 100)}%`, 10, 20);
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
    ]);

    const handleAddRoom = () => {
        if (newRoomCenter && isValid) {
            setAddedRooms([
                ...addedRooms,
                {
                    x: newRoomCenter.x,
                    z: newRoomCenter.z,
                    width: roomWidth,
                    length: roomLength,
                    id: `new-room-${Date.now()}`,
                },
            ]);
            setNewRoomCenter(null);
            setStatus(
                `✅ Đã thêm phòng ${addedRooms.length + 1}. Tổng: ${
                    existingRooms.length + addedRooms.length + 1
                } phòng`
            );
        }
    };

    const handleClear = () => {
        setNewRoomCenter(null);
        setCurrentZone(null);
        setStatus(
            "Nhấp vào vùng xanh lá để đặt phòng mới | Giữ SPACE + kéo chuột để di chuyển view"
        );
    };

    const handleReset = () => {
        setAddedRooms([]);
        setNewRoomCenter(null);
        setCurrentZone(null);
        setStatus("Đã reset - Bắt đầu lại");
    };

    const handleResetView = () => {
        setScale(80);
        setOffsetX(600);
        setOffsetY(400);
    };

    // NEW: Replace handleExport with handleSave
    const handleSave = async () => {
        if (!currentProject || !currentProject.id) {
            message.error("Không tìm thấy project hiện tại!");
            return;
        }

        if (addedRooms.length === 0) {
            message.warning("Không có phòng nào để lưu!");
            return;
        }

        try {
            // Get project height from current project, default to 2.5 if not available
            const projectHeight = currentProject.height || 2.5;

            // Call API for each room
            const promises = addedRooms.map((room) => {
                const roomData = {
                    x: room.x,
                    z: room.z,
                    width: room.width,
                    length: room.length,
                    height: projectHeight,
                };

                return dispatch(
                    addRoom({
                        projectId: currentProject.id,
                        roomData: roomData,
                    })
                ).unwrap();
            });
            await Promise.all(promises);
            await dispatch(fetchObjects(currentProject.id)).unwrap();
            message.success(
                `✅ Đã lưu thành công ${addedRooms.length} phòng vào database!`
            );

            // Clear added rooms after successful save
            setAddedRooms([]);
            setStatus("Đã lưu phòng - Bắt đầu thiết kế phòng mới");
        } catch (error) {
            console.error("Error saving rooms:", error);
            message.error(
                `❌ Lỗi khi lưu phòng: ${error.message || "Unknown error"}`
            );
        }
    };

    return (
        <Layout style={{ height: "100vh", background: "#f0f2f5" }}>
            <Sider
                width={280}
                style={{
                    background: "#fff",
                    padding: 20,
                    overflowY: "auto",
                    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
                }}
            >
                <Title level={4}>🏠 Thiết Kế Phòng 2D</Title>

                <Card
                    size="small"
                    style={{
                        marginBottom: 16,
                        background: "#e8f5e9",
                        border: "1px solid #4caf50",
                    }}
                >
                    <Text strong style={{ fontSize: "12px" }}>
                        💡 Hướng dẫn:
                    </Text>
                    <div style={{ fontSize: "11px", marginTop: 8 }}>
                        • Giữ <strong>SPACE + Kéo chuột</strong>: Di chuyển view
                        <br />• <strong>Cuộn chuột</strong>: Zoom in/out
                        <br />• <strong>Click vùng xanh</strong>: Đặt phòng mới
                    </div>
                </Card>

                {newRoomCenter && (
                    <Card
                        size="small"
                        style={{
                            marginBottom: 16,
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                        }}
                    >
                        <Text strong style={{ color: "white" }}>
                            📍 Tọa độ tâm phòng mới:
                        </Text>
                        <br />
                        <span style={{ display: "block", marginTop: 8 }}>
                            X: <strong>{newRoomCenter.x.toFixed(2)}</strong> m
                        </span>
                        <span style={{ display: "block" }}>
                            Z: <strong>{newRoomCenter.z.toFixed(2)}</strong> m
                        </span>
                    </Card>
                )}

                <Card size="small" style={{ marginBottom: 16 }}>
                    <Text strong>Chiều rộng phòng mới (m):</Text>
                    <InputNumber
                        value={roomWidth}
                        onChange={(v) => setRoomWidth(parseFloat(v) || 0)}
                        min={2}
                        max={10}
                        step={0.5}
                        style={{ width: "100%", marginTop: 8 }}
                    />

                    <Divider />

                    <Text strong>Chiều dài phòng mới (m):</Text>
                    <InputNumber
                        value={roomLength}
                        onChange={(v) => setRoomLength(parseFloat(v) || 0)}
                        min={2}
                        max={10}
                        step={0.5}
                        style={{ width: "100%", marginTop: 8 }}
                    />
                </Card>

                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <Button onClick={handleClear} style={{ flex: 1 }}>
                        🗑️ Xóa
                    </Button>
                    <Button onClick={handleReset} style={{ flex: 1 }}>
                        ↻ Reset
                    </Button>
                </div>

                <Button
                    block
                    onClick={handleResetView}
                    style={{ marginBottom: 16 }}
                >
                    Reset View
                </Button>

                <Button
                    block
                    type="primary"
                    onClick={handleAddRoom}
                    disabled={!isValid}
                    style={{ marginBottom: 16 }}
                >
                    ➕ Thêm Phòng
                </Button>

                {addedRooms.length > 0 && (
                    <>
                        <Button
                            block
                            onClick={handleSave}
                            loading={isAddingRoom}
                            disabled={isAddingRoom}
                            style={{
                                background: "#34a853",
                                color: "white",
                                marginBottom: 16,
                            }}
                        >
                            {isAddingRoom ? (
                                <>
                                    <Spin
                                        size="small"
                                        style={{ marginRight: 8 }}
                                    />
                                    Đang lưu...
                                </>
                            ) : (
                                "💾 Lưu vào Database"
                            )}
                        </Button>

                        <Card size="small">
                            <Text strong>Phòng đã thêm:</Text>
                            <List
                                size="small"
                                dataSource={addedRooms}
                                renderItem={(room, index) => (
                                    <List.Item key={room.id}>
                                        Phòng {index + 1}: ({room.x.toFixed(2)},{" "}
                                        {room.z.toFixed(2)}) - {room.width}m ×{" "}
                                        {room.length}m
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </>
                )}
                <div style={{ marginTop: 16 }}>
                    <Button
                        danger
                        block
                        onClick={() => dispatch(closeRoomDesigner2D())}
                    >
                        ✖ Close
                    </Button>
                </div>
            </Sider>

            <Layout>
                <Content
                    style={{
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        width={1600}
                        height={900}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        style={{
                            background: "white",
                            borderRadius: 8,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            cursor: isSpacePressed ? "grab" : "not-allowed",
                            maxWidth: "100%",
                            maxHeight: "calc(100vh - 120px)",
                        }}
                    />

                    <Card
                        style={{
                            marginTop: 16,
                            textAlign: "center",
                            minWidth: 500,
                            maxWidth: "90%",
                        }}
                    >
                        {status}
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}
