import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  Table, 
  Button, 
  Tag, 
  Card, 
  Space, 
  Badge, 
  Avatar, 
  Typography,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  message
} from "antd";
import { 
  UserOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from "@ant-design/icons";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const user = useSelector((state) => state.user.user);
  const isSystemAdmin = user?.userType === "Sistem Yetkilisi";
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/auth/users");
      setUsers(response.data);
    } catch (error) {
      message.error("Kullanıcılar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (values) => {
    try {
      await api.post("/api/auth/createuser", values);
      message.success("Kullanıcı başarıyla eklendi");
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || "Kullanıcı eklenirken bir hata oluştu");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/api/auth/users/${userId}`);
      message.success("Kullanıcı başarıyla silindi");
      fetchUsers();
    } catch (error) {
      message.error("Kullanıcı silinirken bir hata oluştu");
    }
  };

  const columns = [
    {
      title: "Kullanıcı Bilgileri",
      key: "userInfo",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar size="large" icon={<UserOutlined />} className="bg-blue-500 mr-3" />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.userName}</div>
            <div className="text-sm text-gray-500">{record.password}</div>
          </div>
        </div>
      ),
    },
    {
      title: "İletişim",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.email}</div>
          <div className="text-sm text-gray-500">{record.phone}</div>
        </div>
      ),
    },
    {
      title: "Rol",
      dataIndex: "userType",
      key: "userType",
      render: (userType) => (
        <Tag color={
          userType === "Sistem Yetkilisi" ? "red" :
          userType === "Supervisor" ? "blue" :
          userType === "Onay Yetkilisi" ? "green" :
          userType === "Taşeron" ? "orange" :
          userType === "Tedarikçi" ? "purple" :
          "default"
        }>
          {userType}
        </Tag>
      ),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge 
          status={status === "Aktif" ? "success" : "error"} 
          text={status}
        />
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/profile/${record._id}`)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Görüntüle
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {/* Düzenleme işlemi */}}
            className="bg-green-500 hover:bg-green-600"
          >
            Düzenle
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record._id)}
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <Card className="shadow-lg rounded-2xl border-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <UserOutlined className="text-2xl text-blue-600" />
            </div>
            <Title level={2} className="m-0 text-gray-800">Kullanıcı Yönetimi</Title>
          </div>
          {isSystemAdmin && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsModalVisible(true)}
              className="bg-blue-500 hover:bg-blue-600 shadow-md"
              size="large"
            >
              Yeni Kullanıcı Ekle
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" tip="Kullanıcılar yükleniyor..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            bordered={false}
            loading={loading}
            pagination={{ 
              pageSize: 10, 
              position: ["bottomCenter"],
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kullanıcı`,
              className: "mt-4"
            }}
            size="middle"
            scroll={{ x: 1000 }}
            rowClassName="hover:bg-blue-50 transition-colors"
            className="rounded-lg overflow-hidden"
          />
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center">
            <PlusOutlined className="text-blue-500 mr-2" />
            <span>Yeni Kullanıcı Ekle</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        className="rounded-lg"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUser}
          className="mt-4"
        >
          <Form.Item
            name="fullName"
            label="Ad Soyad"
            rules={[{ required: true, message: "Lütfen ad soyad girin" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>

          <Form.Item
            name="userName"
            label="Kullanıcı Adı"
            rules={[{ required: true, message: "Lütfen kullanıcı adı girin" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Şifre"
            rules={[{ required: true, message: "Lütfen şifre girin" }]}
          >
            <Input.Password className="rounded-md" />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: "Lütfen e-posta girin" },
              { type: "email", message: "Geçerli bir e-posta adresi girin" }
            ]}
          >
            <Input className="rounded-md" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Telefon"
            rules={[{ required: true, message: "Lütfen telefon girin" }]}
          >
            <Input className="rounded-md" />
          </Form.Item>

          <Form.Item
            name="userType"
            label="Rol"
            rules={[{ required: true, message: "Lütfen rol seçin" }]}
          >
            <Select className="rounded-md">
              <Option value="Taşeron">Taşeron</Option>
              <Option value="Supervisor">Supervisor</Option>
              <Option value="Onay Yetkilisi">Onay Yetkilisi</Option>
              <Option value="Sistem Yetkilisi">Sistem Yetkilisi</Option>
              <Option value="Tedarikçi">Tedarikçi</Option>
              <Option value="ISG Personeli">ISG Personeli</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
                className="rounded-md"
              >
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-blue-500 hover:bg-blue-600 rounded-md shadow-md"
              >
                Kaydet
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList; 