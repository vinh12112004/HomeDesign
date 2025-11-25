import React, { useState, useLayoutEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Drawer, Form, Button, Space, Divider } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { closeObjectEditor } from "../../../store/slices/uiSlice";
import { updateObject, fetchObjects } from "../../../store/slices/objectSlice";

import PropertyFields from "./PropertyFields";
import DimensionFields from "./DimensionFields";
import TransformFields from "./TransformFields";
import StyleFields from "./StyleFields";

const ObjectEditor = () => {
    const dispatch = useDispatch();
    const { showObjectEditor, selectedMesh } = useSelector((state) => state.ui);
    const { objects } = useSelector((state) => state.objects);
    const { currentProject } = useSelector((state) => state.projects);

    const [form] = Form.useForm();

    const selectedObject = useMemo(
        () => objects.find((o) => o.id === selectedMesh),
        [objects, selectedMesh]
    );

    useLayoutEffect(() => {
        if (selectedObject) {
            const position = JSON.parse(selectedObject.positionJson);
            const rotation = JSON.parse(selectedObject.rotationJson);
            const scale = JSON.parse(selectedObject.scaleJson);
            const metadata = JSON.parse(selectedObject.metadataJson || "{}");

            form.setFieldsValue({
                name:
                    metadata.name ||
                    `${selectedObject.type} ${selectedObject.id.substring(
                        0,
                        4
                    )}`,
                type: selectedObject.type,
                position,
                rotation,
                scale,
                color: metadata.color || "#F8F8FF",
                ...metadata,
            });
        }
    }, [selectedObject, form]);

    const handleClose = () => {
        dispatch(closeObjectEditor());
        form.resetFields();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (!selectedObject || !currentProject) return;

            const oldMetadata = JSON.parse(selectedObject.metadataJson || "{}");
            const mergedMetadata = {
                ...oldMetadata,
                name: values.name,
                width: values.width,
                length: values.length,
                sizeX: values.sizeX,
                sizeY: values.sizeY,
                sizeZ: values.sizeZ,
                texture: values.texture,
                color:
                    typeof values.color === "string"
                        ? values.color
                        : values.color?.toHexString?.() || "#FFFFFF",
            };

            const updateData = {
                positionJson: JSON.stringify(values.position),
                rotationJson: JSON.stringify(values.rotation),
                scaleJson: JSON.stringify(values.scale),
                metadataJson: JSON.stringify(mergedMetadata),
                // Giữ nguyên các thuộc tính không thay đổi trong form này
                type: selectedObject.type,
                assetKey: selectedObject.assetKey,
            };

            await dispatch(
                updateObject({
                    objectId: selectedObject.id,
                    objectData: updateData,
                })
            ).unwrap();
            await dispatch(fetchObjects(currentProject.id));
            handleClose();
        } catch (error) {
            console.error("Failed to update object:", error);
        }
    };

    if (!selectedObject) return null;

    return (
        <Drawer
            title="Edit Element"
            placement="right"
            width={320}
            open={showObjectEditor}
            onClose={handleClose}
            closable={false}
            extra={
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={handleClose}
                    size="small"
                />
            }
            footer={
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="primary" onClick={handleSave}>
                        Save
                    </Button>
                </Space>
            }
        >
            <Form form={form} layout="vertical">
                <div style={{ color: "#888", marginBottom: 16 }}>
                    ID: {selectedObject.id.substring(0, 8)}...
                </div>

                <Divider orientation="left">Properties</Divider>
                <PropertyFields />

                <DimensionFields objectType={selectedObject.type} />

                <TransformFields />

                <StyleFields />
            </Form>
        </Drawer>
    );
};

export default ObjectEditor;
