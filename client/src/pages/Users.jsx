import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      message.error('Kullanıcılar yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Modal işlemleri
  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  // Kullanıcı kaydet/güncelle
  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser._id}`, values);
        message.success('Kullanıcı başarıyla güncellendi!');
      } else {
        await api.post('/api/users', values);
        message.success('Kullanıcı başarıyla oluşturuldu!');
      }
      handleCancel();
      fetchUsers();
    } catch (error) {
      message.error('Bir hata oluştu!');
    }
  };

  // Kullanıcı sil
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/users/${id}`);
      message.success('Kullanıcı başarıyla silindi!');
      fetchUsers();
    } catch (error) {
      message.error('Kullanıcı silinirken bir hata oluştu!');
    }
  };

  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role.charAt(0).toUpperCase() + role.slice(1),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Bu kullanıcıyı silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDelete(record._id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Yeni Kullanıcı
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} kullanıcı`,
        }}
      />

      <Modal
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ role: 'user' }}
        >
          <Form.Item
            name="fullName"
            label="Ad Soyad"
            rules={[{ required: true, message: 'Lütfen ad soyad girin!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: 'Lütfen e-posta girin!' },
              { type: 'email', message: 'Geçerli bir e-posta girin!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="username"
            label="Kullanıcı Adı"
            rules={[{ required: true, message: 'Lütfen kullanıcı adı girin!' }]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Şifre"
              rules={[{ required: true, message: 'Lütfen şifre girin!' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Lütfen rol seçin!' }]}
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="user">Kullanıcı</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>İptal</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Güncelle' : 'Oluştur'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 