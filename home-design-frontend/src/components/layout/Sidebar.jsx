import React from "react";
import {
    DashboardOutlined,
    FolderOpenOutlined,
    StarOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    BellOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { Menu, Badge } from "antd";

export default function Sidebar({ collapsed }) {
    const items = [
        { key: "1", icon: <DashboardOutlined />, label: "Dashboard" },
        { key: "2", icon: <FolderOpenOutlined />, label: "All Project" },
        { key: "3", icon: <StarOutlined />, label: "Starred" },
        { key: "4", icon: <TeamOutlined />, label: "Shared with me" },
        { key: "5", icon: <ClockCircleOutlined />, label: "Recent" },
        {
            key: "6",
            icon: (
                <Badge count={49} size="small" offset={[8, 0]}>
                    <DeleteOutlined />
                </Badge>
            ),
            label: "Trash",
        },
        { key: "7", icon: <SettingOutlined />, label: "Settings" },
    ];

    return (
        <aside
            style={{
                width: collapsed ? 70 : 240,
                transition: "width 0.3s ease",
                height: "100vh",
                borderRight: "1px solid #f0f0f0",
                background: "#fff",
                overflow: "hidden",
            }}
        >
            <Menu
                mode="inline"
                defaultSelectedKeys={["2"]}
                items={items}
                style={{ border: "none", paddingTop: 16 }}
            />
        </aside>
    );
}
