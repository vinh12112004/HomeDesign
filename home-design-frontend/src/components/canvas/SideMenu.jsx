import React, { useState } from "react";
import {
    Button,
    Divider,
    Modal,
    Form,
    InputNumber,
    message,
    Tooltip,
    Space,
    theme,
} from "antd";
import {
    DragOutlined,
    RotateRightOutlined,
    PlusOutlined,
    GatewayOutlined, // Dùng cho Break Wall (nhìn giống cái cổng/lỗ)
    SelectOutlined,
    SettingOutlined,
    AppstoreAddOutlined,
    ExpandOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import FurniturePickerModal from "./FurniturePickerModal/FurniturePickerModal";
import {
    createObject,
    fetchObjects,
    createHole,
} from "../../store/slices/objectSlice";
import {
    setSelectedMesh,
    openObjectEditor,
    openTransformControls,
    closeTransformControls,
    clearSelectedMesh,
    openAddRoom2D,
    openMoveRoom2D,
} from "../../store/slices/uiSlice";

const SideMenu = () => {
    const dispatch = useDispatch();
    const { token } = theme.useToken(); // Sử dụng theme token để lấy màu chuẩn
    const { currentProject } = useSelector((s) => s.projects);
    const { selectedMesh } = useSelector((s) => s.ui);
    const { objects } = useSelector((s) => s.objects);

    const [openPicker, setOpenPicker] = useState(false);
    const [openBreakWall, setOpenBreakWall] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [form] = Form.useForm();

    const selectedObject = objects.find((obj) => obj.id === selectedMesh);
    const isWallSelected = selectedObject?.type === "Wall";

    const handleMoveClick = () => {
        if (selectedMesh && isMoving === false) {
            dispatch(openTransformControls("translate"));
            setIsMoving(true);
            setIsRotating(false); // Tắt rotate nếu đang bật
        } else {
            dispatch(closeTransformControls());
            setIsMoving(false);
        }
    };

    const handleRotateClick = () => {
        if (selectedMesh && isRotating === false) {
            dispatch(openTransformControls("rotate"));
            setIsRotating(true);
            setIsMoving(false); // Tắt move nếu đang bật
        } else {
            dispatch(closeTransformControls());
            setIsRotating(false);
        }
    };

    const handleDeselectClick = () => {
        dispatch(clearSelectedMesh());
        setIsMoving(false);
        setIsRotating(false);
    };

    const handleAddRoom = () => {
        dispatch(openAddRoom2D());
    };

    const handlePropertiesClick = () => {
        if (selectedMesh) {
            dispatch(openObjectEditor());
        }
    };

    const handleBreakWallClick = () => {
        if (!isWallSelected) {
            message.warning("Please select a wall first");
            return;
        }
        form.setFieldsValue({
            width: 1,
            height: 2,
            depth: 0.2,
            centerX: 0,
            centerY: -1.5,
            centerZ: 0,
        });
        setOpenBreakWall(true);
    };

    const handleBreakWallSubmit = async () => {
        try {
            const values = await form.validateFields();
            const holeData = {
                width: values.width,
                height: values.height,
                depth: values.depth,
                center: {
                    x: values.centerX,
                    y: values.centerY,
                    z: values.centerZ,
                },
            };
            await dispatch(
                createHole({
                    objectId: selectedMesh,
                    holeData,
                    projectId: currentProject.id,
                })
            ).unwrap();
            message.success("Hole created successfully");
            setOpenBreakWall(false);
        } catch (error) {
            message.error("Failed to create hole");
        }
    };

    const handleSelectFurniture = async (modelData) => {
        if (!currentProject || !modelData) return;
        let parsed;
        try {
            parsed = JSON.parse(modelData);
        } catch {
            parsed = { objPath: modelData };
        }
        const { roomId, ...modelWithoutRoom } = parsed;
        const objectData = {
            type: "Furniture",
            assetKey: "model/obj",
            positionJson: JSON.stringify({ x: 0, y: 0, z: 0 }),
            rotationJson: JSON.stringify({ x: 0, y: 0, z: 0 }),
            scaleJson: JSON.stringify({ x: 0.01, y: 0.01, z: 0.01 }),
            metadataJson: JSON.stringify({
                geometry: "model",
                ...modelWithoutRoom,
            }),
            roomId: roomId,
        };

        try {
            const created = await dispatch(
                createObject({ projectId: currentProject.id, objectData })
            ).unwrap();
            if (created?.id) dispatch(setSelectedMesh(created.id));
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(fetchObjects(currentProject.id));
        }
    };

    // --- Render ---
    return (
        <>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between", // Căn đều 2 bên
                    height: 64, // Tăng chiều cao một chút cho thoáng
                    padding: "0 24px",
                    background: "rgba(255, 255, 255, 0.95)", // Hiệu ứng kính nhẹ
                    backdropFilter: "blur(10px)",
                    borderBottom: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    zIndex: 50,
                    position: "relative",
                }}
            >
                {/* Left Section: Tools */}
                <Space
                    split={<Divider type="vertical" style={{ height: 24 }} />}
                >
                    {/* Group 1: Creation */}
                    <Space>
                        <Tooltip title="Add Furniture">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setOpenPicker(true)}
                                shape="circle"
                                size="large"
                            />
                        </Tooltip>
                        <Tooltip title="Add Room (2D)">
                            <Button
                                icon={<AppstoreAddOutlined />}
                                onClick={handleAddRoom}
                            >
                                Add Room
                            </Button>
                        </Tooltip>
                        <Tooltip title="Move Room Layout">
                            <Button
                                icon={<ExpandOutlined />}
                                onClick={() => dispatch(openMoveRoom2D())}
                            />
                        </Tooltip>
                    </Space>

                    {/* Group 2: Transformation (Chỉ hiện khi select object) */}
                    <Space>
                        <Tooltip title="Move Object">
                            <Button
                                type={isMoving ? "primary" : "text"}
                                icon={<DragOutlined />}
                                onClick={handleMoveClick}
                                disabled={!selectedMesh}
                            />
                        </Tooltip>
                        <Tooltip title="Rotate Object">
                            <Button
                                type={isRotating ? "primary" : "text"}
                                icon={<RotateRightOutlined />}
                                onClick={handleRotateClick}
                                disabled={!selectedMesh}
                            />
                        </Tooltip>
                    </Space>

                    {/* Group 3: Context Actions */}
                    <Space>
                        <Tooltip
                            title={
                                isWallSelected
                                    ? "Break Hole in Wall"
                                    : "Select a wall to break"
                            }
                        >
                            <Button
                                type={openBreakWall ? "primary" : "default"}
                                icon={<GatewayOutlined />}
                                onClick={handleBreakWallClick}
                                disabled={!isWallSelected}
                                danger={isWallSelected} // Làm nổi bật nút này nếu là tường
                            >
                                {isWallSelected ? "Break Wall" : "Hole"}
                            </Button>
                        </Tooltip>
                    </Space>
                </Space>

                {/* Right Section: Properties & System */}
                <Space split={<Divider type="vertical" />}>
                    <Tooltip title="Object Properties">
                        <Button
                            type="text"
                            icon={<SettingOutlined spin={!!selectedMesh} />}
                            onClick={handlePropertiesClick}
                            disabled={!selectedMesh}
                            style={{
                                color: selectedMesh
                                    ? token.colorPrimary
                                    : undefined,
                            }}
                        >
                            Properties
                        </Button>
                    </Tooltip>

                    <Tooltip title="Deselect All">
                        <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={handleDeselectClick}
                            disabled={!selectedMesh}
                        >
                            Deselect
                        </Button>
                    </Tooltip>
                </Space>

                <FurniturePickerModal
                    open={openPicker}
                    onClose={() => setOpenPicker(false)}
                    onSelect={handleSelectFurniture}
                />
            </div>

            {/* Break Wall Modal - Giữ nguyên logic form */}
            <Modal
                title={
                    <span>
                        <GatewayOutlined /> Create Hole in Wall
                    </span>
                }
                open={openBreakWall}
                onOk={handleBreakWallSubmit}
                onCancel={() => setOpenBreakWall(false)}
                okText="Create Hole"
                centered
                width={400}
            >
                {/* Form giữ nguyên như cũ, chỉ chỉnh lại styling padding nếu cần */}
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        width: 1,
                        height: 2,
                        depth: 0.2,
                        centerX: 0,
                        centerY: -1.5,
                        centerZ: 0,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 8,
                        }}
                    >
                        <Form.Item
                            label="Width"
                            name="width"
                            rules={[{ required: true }]}
                        >
                            <InputNumber style={{ width: "100%" }} step={0.1} />
                        </Form.Item>
                        <Form.Item
                            label="Height"
                            name="height"
                            rules={[{ required: true }]}
                        >
                            <InputNumber style={{ width: "100%" }} step={0.1} />
                        </Form.Item>
                        <Form.Item
                            label="Depth"
                            name="depth"
                            rules={[{ required: true }]}
                        >
                            <InputNumber style={{ width: "100%" }} step={0.1} />
                        </Form.Item>
                    </div>
                    <Divider plain>Center Position</Divider>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 8,
                        }}
                    >
                        <Form.Item
                            label="X"
                            name="centerX"
                            rules={[{ required: true }]}
                        >
                            <InputNumber style={{ width: "100%" }} step={0.1} />
                        </Form.Item>
                        <Form.Item
                            label="Y"
                            name="centerY"
                            rules={[{ required: true }]}
                        >
                            <InputNumber style={{ width: "100%" }} step={0.1} />
                        </Form.Item>
                        <Form.Item
                            label="Z"
                            name="centerZ"
                            rules={[{ required: true }]}
                        >
                            <InputNumber style={{ width: "100%" }} step={0.1} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default SideMenu;
