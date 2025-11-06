import React, { useState } from "react";
import { Button, Divider, Modal, Form, InputNumber, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import FurniturePickerModal from "./FurniturePickerModal";
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
} from "../../store/slices/uiSlice";
const SideMenu = () => {
    const dispatch = useDispatch();
    const { currentProject } = useSelector((s) => s.projects);
    const { selectedMesh } = useSelector((s) => s.ui);
    const { objects } = useSelector((s) => s.objects);

    const [openPicker, setOpenPicker] = useState(false);
    const [openBreakWall, setOpenBreakWall] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [form] = Form.useForm();

    // Kiểm tra xem object được chọn có phải là Wall không
    const selectedObject = objects.find((obj) => obj.id === selectedMesh);
    const isWallSelected = selectedObject?.type === "Wall";

    const handleMoveClick = () => {
        if (selectedMesh && isMoving === false) {
            dispatch(openTransformControls("translate"));
            setIsMoving(true);
        } else {
            dispatch(closeTransformControls());
            setIsMoving(false);
        }
    };

    const handleRotateClick = () => {
        if (selectedMesh && isRotating === false) {
            dispatch(openTransformControls("rotate"));
            setIsRotating(true);
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
        // Set giá trị mặc định cho form
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

            // Sử dụng Redux action thay vì gọi API trực tiếp
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
            if (error.errorFields) {
                message.error("Please fill in all required fields");
            } else {
                console.error("Create hole failed:", error);
                message.error("Failed to create hole");
            }
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

        const objectData = {
            type: "Furniture",
            assetKey: "model/obj",
            positionJson: JSON.stringify({ x: 0, y: 0, z: 0 }),
            rotationJson: JSON.stringify({ x: 0, y: 0, z: 0 }),
            scaleJson: JSON.stringify({ x: 0.01, y: 0.01, z: 0.01 }),
            metadataJson: JSON.stringify({
                geometry: "model",
                ...parsed,
            }),
        };

        try {
            const created = await dispatch(
                createObject({
                    projectId: currentProject.id,
                    objectData,
                })
            ).unwrap();

            if (created?.id) {
                dispatch(setSelectedMesh(created.id));
            }
        } catch (e) {
            console.error("Create furniture failed:", e?.message || e);
        } finally {
            dispatch(fetchObjects(currentProject.id));
        }
    };

    return (
        <>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 56,
                    padding: "0 16px",
                    background: "#ffffff",
                    borderBottom: "1px solid #eee",
                    boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
                    zIndex: 50,
                }}
            >
                <Button type="default" onClick={() => setOpenPicker(true)}>
                    Add
                </Button>
                <Button
                    type={isMoving ? "primary" : "default"}
                    onClick={handleMoveClick}
                >
                    Move
                </Button>
                <Button
                    type={isRotating ? "primary" : "default"}
                    onClick={handleRotateClick}
                >
                    Rotate
                </Button>
                <Button
                    type="default"
                    onClick={handleBreakWallClick}
                    disabled={!isWallSelected}
                >
                    Break Wall
                </Button>
                <Button
                    type="default"
                    onClick={handleDeselectClick}
                    disabled={!selectedMesh}
                >
                    Deselect
                </Button>

                <div style={{ flex: 1 }} />
                <Divider
                    type="vertical"
                    style={{ height: 24, margin: "0 8px" }}
                />

                <Button
                    type="primary"
                    onClick={handlePropertiesClick}
                    disabled={!selectedMesh}
                    style={{ marginLeft: "auto" }}
                >
                    Properties
                </Button>

                <FurniturePickerModal
                    open={openPicker}
                    onClose={() => setOpenPicker(false)}
                    onSelect={handleSelectFurniture}
                />
            </div>

            {/* Break Wall Modal */}
            <Modal
                title="Create Hole in Wall"
                open={openBreakWall}
                onOk={handleBreakWallSubmit}
                onCancel={() => setOpenBreakWall(false)}
                okText="Create Hole"
                cancelText="Cancel"
                width={500}
            >
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
                    <div style={{ marginBottom: 16 }}>
                        <strong>Hole Dimensions:</strong>
                    </div>
                    <Form.Item
                        label="Width"
                        name="width"
                        rules={[
                            { required: true, message: "Please input width" },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            step={0.1}
                            min={0.1}
                            placeholder="Width of the hole"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Height"
                        name="height"
                        rules={[
                            { required: true, message: "Please input height" },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            step={0.1}
                            min={0.1}
                            placeholder="Height of the hole"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Depth"
                        name="depth"
                        rules={[
                            { required: true, message: "Please input depth" },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            step={0.1}
                            min={0.1}
                            placeholder="Depth of the hole"
                        />
                    </Form.Item>

                    <Divider />

                    <div style={{ marginBottom: 16 }}>
                        <strong>Hole Center Position:</strong>
                    </div>
                    <Form.Item
                        label="Center X"
                        name="centerX"
                        rules={[
                            {
                                required: true,
                                message: "Please input center X",
                            },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            step={0.1}
                            placeholder="X position of hole center"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Center Y"
                        name="centerY"
                        rules={[
                            {
                                required: true,
                                message: "Please input center Y",
                            },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            step={0.1}
                            placeholder="Y position of hole center"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Center Z"
                        name="centerZ"
                        rules={[
                            {
                                required: true,
                                message: "Please input center Z",
                            },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            step={0.1}
                            placeholder="Z position of hole center"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default SideMenu;
