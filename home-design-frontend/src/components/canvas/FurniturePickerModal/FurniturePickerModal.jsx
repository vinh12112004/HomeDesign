import React, { useEffect, useMemo, useState } from "react";
import { Modal, Input, Tabs, theme } from "antd";
import {
    SearchOutlined,
    AppstoreOutlined,
    CloudUploadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssets } from "../../../store/slices/assetSlice";
import FurnitureGrid from "./FurnitureGrid";
import RoomSelector from "./RoomSelector";
import FurnitureUpload from "./FurnitureUpload";

const FurniturePickerModal = ({ open, onClose, onSelect }) => {
    const dispatch = useDispatch();
    const { token } = theme.useToken();

    const items = useSelector((s) => s.assets.items.furniture || []);
    const loading = useSelector((s) => s.assets.loading.furniture);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [filter, setFilter] = useState("");
    const [selectedModel, setSelectedModel] = useState(null);
    const [activeTab, setActiveTab] = useState("library");

    // Load furniture assets
    useEffect(() => {
        if (open && items.length === 0) {
            dispatch(fetchAssets({ type: "furniture" }));
        }
    }, [open, items.length, dispatch]);

    const filteredItems = useMemo(
        () =>
            items.filter((model) =>
                model?.nameModel?.toLowerCase()?.includes(filter.toLowerCase())
            ),
        [items, filter]
    );

    const handleConfirm = () => {
        if (!selectedModel || !selectedRoom) return;

        onSelect?.(
            JSON.stringify({
                ...selectedModel,
                room: selectedRoom,
            })
        );
        console.log("for room:", selectedRoom);
        onClose?.();

        // Reset state
        setSelectedModel(null);
        setSelectedRoom(null);
        setFilter("");
    };

    const itemsTabs = [
        {
            key: "library",
            label: (
                <span>
                    <AppstoreOutlined /> Library
                </span>
            ),
            children: (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    }}
                >
                    {/* Select Room */}
                    <RoomSelector
                        value={selectedRoom}
                        onChange={setSelectedRoom}
                    />

                    {/* Search */}
                    <Input
                        prefix={
                            <SearchOutlined
                                style={{ color: token.colorTextDescription }}
                            />
                        }
                        placeholder="Search furniture models..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        allowClear
                        size="large"
                        style={{ marginBottom: 16, borderRadius: 8 }}
                    />

                    {/* Grid */}
                    <div
                        style={{ flex: 1, overflow: "hidden", minHeight: 380 }}
                    >
                        <FurnitureGrid
                            items={filteredItems}
                            loading={loading}
                            selected={selectedModel}
                            onSelect={setSelectedModel}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: "upload",
            label: (
                <span>
                    <CloudUploadOutlined /> Upload New
                </span>
            ),
            children: (
                <FurnitureUpload onSuccess={() => setActiveTab("library")} />
            ),
        },
    ];

    return (
        <Modal
            title="Furniture Library"
            open={open}
            onOk={handleConfirm}
            onCancel={onClose}
            okText="Add to Scene"
            okButtonProps={{
                disabled:
                    !selectedModel || !selectedRoom || activeTab === "upload",
            }}
            width={900}
            centered
            styles={{
                body: {
                    paddingTop: 10,
                    height: 600,
                    overflow: "hidden",
                },
            }}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={itemsTabs}
                style={{ height: "100%" }}
            />
        </Modal>
    );
};

export default FurniturePickerModal;
