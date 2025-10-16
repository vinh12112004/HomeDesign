import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, clearError } from '../store/slices/projectSlice';
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ProjectTable from "../components/projects/ProjectTable";
import { Button, Input, message } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import NewProjectModal from "../components/projects/NewProjectModal";

export default function AllProjectsPage() {
  const dispatch = useDispatch();
  const { isCreating, error } = useSelector(state => state.projects);
  
  const [collapsed, setCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Show error message when error occurs
  useEffect(() => {
    if (error) {
      messageApi.error(error);
      dispatch(clearError());
    }
  }, [error, messageApi, dispatch]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
      {messageContextHolder}
      <Sidebar collapsed={collapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header onToggleSidebar={toggleSidebar} />
        <main style={{ padding: 24, overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
              All Projects
            </h2>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search project..."
              style={{ width: 260 }}
            />
            <Button type="primary" onClick={showModal} loading={isCreating}>
              New Project
            </Button>
            <Button icon={<FilterOutlined />}>Filter</Button>
          </div>
          
          <ProjectTable />
          
          <NewProjectModal
            visible={isModalVisible}
            onCancel={handleCancel}
          />
        </main>
      </div>
    </div>
  );
}