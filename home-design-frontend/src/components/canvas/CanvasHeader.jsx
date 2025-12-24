import React from "react";
import { Link } from "react-router-dom";
import { Button, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { undo, redo, clearHistory } from "../../store/slices/undoSlice";
import {
    updateObjectLocal,
    updateObject,
} from "../../store/slices/objectSlice";
import { message, notification } from "antd";
import {
    InfoCircleOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    SaveOutlined,
    ShareAltOutlined,
} from "@ant-design/icons";

const APP_NAME = "HomeDesign";

const CanvasHeader = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const { currentProject } = useSelector((state) => state.projects);
    const dispatch = useDispatch();
    const { undoStack, redoStack } = useSelector((state) => state.undo);
    const { objects, originalObjects } = useSelector((s) => s.objects);

    const handleSave = async () => {
        const changedObjects = objects.filter((obj) => {
            const orig = originalObjects.find((o) => o.id === obj.id);
            if (!orig) return false;

            return (
                obj.positionJson !== orig.positionJson ||
                obj.rotationJson !== orig.rotationJson ||
                obj.scaleJson !== orig.scaleJson ||
                obj.metadataJson !== orig.metadataJson
            );
        });

        if (changedObjects.length === 0) {
            message.info("No changes to save");
            return;
        }

        try {
            await Promise.all(
                changedObjects.map((obj) =>
                    dispatch(
                        updateObject({
                            objectId: obj.id,
                            objectData: {
                                type: obj.type,
                                assetKey: obj.assetKey,
                                positionJson: obj.positionJson,
                                rotationJson: obj.rotationJson,
                                scaleJson: obj.scaleJson,
                                metadataJson: obj.metadataJson,
                                roomId: obj.roomId ?? null,
                            },
                        })
                    )
                )
            );

            dispatch(clearHistory());
            messageApi.success(`Save successful`);
        } catch (e) {
            console.error(e);
            messageApi.error("Save failed");
        }
    };

    const handleShare = () => {
        console.log("Share project:", currentProject);
        // Implement share functionality
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;

        const lastAction = undoStack[undoStack.length - 1];

        if (lastAction.type === "UPDATE_OBJECT") {
            dispatch(
                updateObjectLocal({
                    objectId: lastAction.before.id,
                    objectData: {
                        positionJson: lastAction.before.positionJson,
                        rotationJson: lastAction.before.rotationJson,
                        scaleJson: lastAction.before.scaleJson,
                        metadataJson: lastAction.before.metadataJson,
                    },
                })
            );
        }

        dispatch(undo());
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;

        const nextAction = redoStack[redoStack.length - 1];

        if (nextAction.type === "UPDATE_OBJECT") {
            dispatch(
                updateObjectLocal({
                    objectId: nextAction.after.id,
                    objectData: {
                        positionJson: nextAction.after.positionJson,
                        rotationJson: nextAction.after.rotationJson,
                        scaleJson: nextAction.after.scaleJson,
                        metadataJson: nextAction.after.metadataJson,
                    },
                })
            );
        }

        dispatch(redo());
    };

    return (
        <>
            {contextHolder}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderBottom: "1px solid #e8e8e8",
                    backgroundColor: "white",
                    zIndex: 20,
                }}
            >
                {/* Left Side: Current Project & Info */}
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold" }}>
                        {currentProject?.name || "Untitled Project"}
                    </span>
                    <Tooltip title="Project Information">
                        <InfoCircleOutlined
                            style={{ marginLeft: 8, cursor: "pointer" }}
                        />
                    </Tooltip>
                </div>

                {/* Center: App Logo/Name */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: "bold",
                        color: "#6A5ACD",
                    }}
                >
                    <span
                        role="img"
                        aria-label="logo"
                        style={{ fontSize: 20, marginRight: 5 }}
                    >
                        ⚛️
                    </span>
                    {APP_NAME}
                </div>

                {/* Right Side: Actions */}
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Tooltip title="Undo">
                        <ArrowLeftOutlined
                            style={{
                                margin: "0 8px",
                                cursor: undoStack.length
                                    ? "pointer"
                                    : "not-allowed",
                                color: undoStack.length ? undefined : "#ccc",
                            }}
                            onClick={handleUndo}
                        />
                    </Tooltip>

                    <Tooltip title="Redo">
                        <ArrowRightOutlined
                            style={{
                                margin: "0 8px",
                                cursor: redoStack.length
                                    ? "pointer"
                                    : "not-allowed",
                                color: redoStack.length ? undefined : "#ccc",
                            }}
                            onClick={handleRedo}
                        />
                    </Tooltip>

                    <Tooltip title="Save">
                        <SaveOutlined
                            style={{ margin: "0 8px", cursor: "pointer" }}
                            onClick={handleSave}
                        />
                    </Tooltip>
                    <Tooltip title="Share">
                        <ShareAltOutlined
                            style={{ margin: "0 8px", cursor: "pointer" }}
                            onClick={handleShare}
                        />
                    </Tooltip>
                    <Link to="/" style={{ marginLeft: 16 }}>
                        <Button>Back</Button>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default CanvasHeader;
