import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addRoom } from "../../store/slices/projectSlice";
import { fetchObjects } from "../../store/slices/objectSlice";
import {
    doRoomsOverlap,
    calculateValidZones,
} from "../../utils/roomCalculations";
import SideBarMoveRoom2D from "./SideBarMoveRoom2D.jsx";
import CanvasRenderer from "./CanvasRenderer.jsx";
import { Layout, Card, Typography, message } from "antd";
import { usePanZoom } from "../../hooks/usePanZoom";

import {
    findZoneContainingPoint,
    screenToWorld,
    isClickOnCenter,
    constrainToZone,
} from "../../utils/roomHelpers.js";

const { Content } = Layout;

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

    const [roomName, setRoomName] = useState("Phòng Mới");

    // ui state
    const [newRoomCenter, setNewRoomCenter] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [addedRooms, setAddedRooms] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [status, setStatus] = useState("Nhấp hoặc kéo để đặt tâm phòng mới");
    const [validZones, setValidZones] = useState([]);
    const [showZones] = useState(true); // Always show zones, no toggle
    const [currentZone, setCurrentZone] = useState(null);

    // Use the custom usePanZoom hook
    const {
        isPanning,
        isSpacePressed,
        handleWheel,
        handleMouseDown: panZoomMouseDown,
        handleMouseMove: panZoomMouseMove,
        handleMouseUp: panZoomMouseUp,
    } = usePanZoom(
        canvasRef,
        scale,
        offsetX,
        offsetY,
        setScale,
        setOffsetX,
        setOffsetY
    );

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
                name: meta.name || `Room ${floor.id.substring(0, 4)}`,
            };
        });

    useEffect(() => {
        setValidZones(
            calculateValidZones(
                existingRooms,
                addedRooms,
                roomWidth,
                roomLength
            )
        );
    }, [roomWidth, roomLength, addedRooms]);

    const isPointInValidZone = (x, z) =>
        !!findZoneContainingPoint(validZones, x, z);

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;

        // If space is pressed, delegate to pan/zoom handler
        if (isSpacePressed) {
            panZoomMouseDown(e);
            canvas.style.cursor = "grabbing";
            return;
        }

        const worldPos = screenToWorld(
            canvasRef.current,
            e.clientX,
            e.clientY,
            offsetX,
            offsetY,
            scale
        );

        if (
            isClickOnCenter(
                canvasRef.current,
                newRoomCenter,
                e.clientX,
                e.clientY,
                scale,
                offsetX,
                offsetY
            )
        ) {
            const zone = findZoneContainingPoint(
                validZones,
                newRoomCenter.x,
                newRoomCenter.z
            );
            setCurrentZone(zone);
            setIsDragging(true);
            canvas.style.cursor = "grabbing";
        } else if (isPointInValidZone(worldPos.x, worldPos.z)) {
            const zone = findZoneContainingPoint(
                validZones,
                worldPos.x,
                worldPos.z
            );
            if (zone) {
                const constrainedPos = constrainToZone(
                    zone,
                    worldPos.x,
                    worldPos.z,
                    roomWidth,
                    roomLength
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

        // Handle panning if active
        if (isPanning) {
            panZoomMouseMove(e);
            return;
        }

        const worldPos = screenToWorld(
            canvasRef.current,
            e.clientX,
            e.clientY,
            offsetX,
            offsetY,
            scale
        );

        if (isDragging && newRoomCenter && currentZone) {
            const constrainedPos = constrainToZone(
                currentZone,
                worldPos.x,
                worldPos.z,
                roomWidth,
                roomLength
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
            } else if (
                newRoomCenter &&
                isClickOnCenter(
                    canvasRef.current,
                    newRoomCenter,
                    e.clientX,
                    e.clientY,
                    scale,
                    offsetX,
                    offsetY
                )
            ) {
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
        setCurrentZone(null);
        panZoomMouseUp();

        const canvas = canvasRef.current;
        if (canvas) {
            if (isSpacePressed) {
                canvas.style.cursor = "grab";
            } else if (newRoomCenter) {
                canvas.style.cursor = "grab";
            }
        }
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

    const handleAddRoom = () => {
        if (newRoomCenter && isValid) {
            setAddedRooms([
                ...addedRooms,
                {
                    x: newRoomCenter.x,
                    z: newRoomCenter.z,
                    width: roomWidth,
                    length: roomLength,
                    name: roomName || `Room ${addedRooms.length + 1}`,
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
            const projectHeight = currentProject.height || 2.5;

            const promises = addedRooms.map((room) => {
                const roomData = {
                    x: room.x,
                    z: room.z,
                    width: room.width,
                    length: room.length,
                    height: projectHeight,
                    name: room.name || `Room ${room.id.substring(0, 4)}`,
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
            <SideBarMoveRoom2D
                roomName={roomName}
                setRoomName={setRoomName}
                roomWidth={roomWidth}
                setRoomWidth={setRoomWidth}
                roomLength={roomLength}
                setRoomLength={setRoomLength}
                newRoomCenter={newRoomCenter}
                isValid={isValid}
                addedRooms={addedRooms}
                isAddingRoom={isAddingRoom}
                handleClear={handleClear}
                handleReset={handleReset}
                handleResetView={handleResetView}
                handleAddRoom={handleAddRoom}
                handleSave={handleSave}
            />

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

                    {/* Canvas Renderer Component */}
                    <CanvasRenderer
                        canvasRef={canvasRef}
                        existingRooms={existingRooms}
                        addedRooms={addedRooms}
                        newRoomCenter={newRoomCenter}
                        roomWidth={roomWidth}
                        roomLength={roomLength}
                        isDragging={isDragging}
                        scale={scale}
                        offsetX={offsetX}
                        offsetY={offsetY}
                        validZones={validZones}
                        showZones={showZones}
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
