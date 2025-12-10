import React, { useEffect, useMemo, useState } from "react";
import { Modal, Input, Tabs, Empty, theme } from "antd";
import {
    SearchOutlined,
    AppstoreOutlined,
    CloudUploadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssets } from "../../../store/slices/assetSlice";
import FurnitureGrid from "./FurnitureGrid";
import FurnitureUpload from "./FurnitureUpload";

const FurniturePickerModal = ({ open, onClose, onSelect }) => {
    const dispatch = useDispatch();
    const { token } = theme.useToken();
    const items = useSelector((s) => s.assets.items.furniture || []);
    const loading = useSelector((s) => s.assets.loading.furniture);

    const [filter, setFilter] = useState("");
    const [selectedModel, setSelectedModel] = useState(null);
    const [activeTab, setActiveTab] = useState("library");

    useEffect(() => {
        if (open && items.length === 0) {
            dispatch(fetchAssets({ type: "furniture" }));
        }
    }, [open, items.length, dispatch]);

    const filteredItems = useMemo(
        () =>
            (items || []).filter((model) =>
                model?.nameModel
                    ?.toLowerCase?.()
                    ?.includes(filter.toLowerCase())
            ),
        [items, filter]
    );

    const handleConfirm = () => {
        if (selectedModel) {
            onSelect?.(JSON.stringify(selectedModel));
            onClose?.();
            // Reset state sau khi add
            setSelectedModel(null);
            setFilter("");
        }
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

                    <div
                        style={{ flex: 1, overflow: "hidden", minHeight: 400 }}
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
                disabled: !selectedModel || activeTab === "upload",
            }}
            width={900}
            centered
            bodyStyle={{ paddingTop: 10, height: 600, overflow: "hidden" }}
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
