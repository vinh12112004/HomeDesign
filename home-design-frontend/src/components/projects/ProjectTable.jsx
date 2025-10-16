import React from "react";
import { Table, Tag, Dropdown, Alert, Modal, message } from "antd";
import { EllipsisOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from 'react-redux';
import { deleteProject, setCurrentProject } from '../../store/slices/projectSlice';
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { key: 'open', label: 'Open Project' },
  { key: 'rename', label: 'Rename' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'share', label: 'Share' },
  { key: 'delete', label: <span style={{ color: 'red' }}>Move to Trash</span>, danger: true },
];

export default function ProjectTable() {
  const dispatch = useDispatch();
  const { projects, loading, isDeleting, error } = useSelector(state => state.projects);
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const navigate = useNavigate();
  
  if (error) {
    return <Alert message="Error" description="Could not fetch project data." type="error" showIcon />;
  }

  const handleMenuClick = (e, record) => {
    switch (e.key) {
      case 'open':
        console.log("Opening project:", record);
        dispatch(setCurrentProject(record));
        navigate('/canvas');
        break;
      
      case 'rename':
        console.log("Renaming project:", record);
        break;

      case 'delete':
        console.log("Deleting project:", record);
        showDeleteConfirm(record);
        break;

      default:
        console.log(`Action '${e.key}' clicked on project:`, record);
    }
  };

  const showDeleteConfirm = (record) => {
    modal.confirm({
      title: `Are you sure you want to delete "${record.name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk: async () => {
        try {
          console.log(`Confirmed deletion for project:`, record);
          await dispatch(deleteProject(record.id)).unwrap();
          messageApi.success("Project deleted successfully!");
        } catch (error) {
          messageApi.error("Failed to delete project. Please try again.");
        }
      },
    });
  };

  const columns = [
    { 
      title: "Name", 
      dataIndex: "name", 
      key: "name", 
      render: (text) => <a>{text}</a> 
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: 'center',
      render: (status) => <Tag color={status === "public" ? "blue" : "default"}>{status}</Tag>,
    },
    { 
      title: "Modified", 
      dataIndex: "modifiedAt",
      key: "modifiedAt",
      align: 'center',
      render: (datestring) => dayjs(datestring).format('DD/MM/YYYY')
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (datestring) => dayjs(datestring).format('DD/MM/YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (record) => (
        <Dropdown menu={{ items: menuItems, onClick: (e) => handleMenuClick(e, record) }} trigger={['click']}>
          <a onClick={(e) => e.preventDefault()}>
            <EllipsisOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
          </a>
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8, marginTop: 24 }}>
      {contextHolder}
      {messageContextHolder}
      <Table 
        dataSource={projects}
        columns={columns} 
        loading={loading || isDeleting}
        pagination={{ pageSize: 10 }}
        rowKey="id"
      />
    </div>
  );
}