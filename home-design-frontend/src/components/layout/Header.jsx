import React from "react";
import {
    MenuOutlined,
    SearchOutlined,
    BellOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Input, Button, Avatar, Space, Tooltip } from "antd";

export default function Header({ onToggleSidebar }) {
    return (
        <header
            style={{
                height: 64,
                background: "#fff",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
            }}
        >
            {/* Left side: hamburger + logo */}
            <Space align="center" size="middle">
                <Button
                    icon={<MenuOutlined />}
                    type="text"
                    onClick={onToggleSidebar}
                    style={{ fontSize: 18 }}
                />
                <img
                    src="/logo.png" // 1. Sửa đường dẫn
                    alt="HomeDesign Logo"
                    style={{
                        height: "49px", // 2. Thêm chiều cao
                        width: "49px", // 3. Thêm chiều rộng
                        borderRadius: "50%", // 4. Bo tròn để thành hình tròn
                        objectFit: "cover", // 5. Đảm bảo ảnh không bị méo
                    }}
                />
                <span
                    style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#1677ff",
                    }}
                >
                    HomeDesign
                </span>
            </Space>

            {/* Right side: search, filter, new project, avatar */}
            <Space align="center" size="middle">
                <Tooltip title="Notifications">
                    <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                </Tooltip>
                <Tooltip title="User Profile">
                    <Avatar icon={<UserOutlined />} />
                </Tooltip>
            </Space>
        </header>
    );
}
