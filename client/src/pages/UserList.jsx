import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Typography, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { fetchAllUsers } from '../redux/userSlice';

const { Text } = Typography;

const UserList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { allUsers, loading } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const columns = [
        {
            title: 'Ad Soyad',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <div className="flex items-center">
                    <UserOutlined className="mr-2" />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'E-posta',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Telefon',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Rol',
            dataIndex: 'userType',
            key: 'userType',
            render: (userType) => (
                <Tag color={userType === 'Sistem Yetkilisi' ? 'red' : 'blue'}>
                    {userType}
                </Tag>
            ),
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    onClick={() => navigate(`/profile/${record._id}`)}
                >
                    Profili Görüntüle
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold">Kullanıcı Listesi</h2>
            </div>
            {loading ? (
                <div className="text-center py-8">
                    <Spin tip="Kullanıcılar yükleniyor..." />
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={allUsers}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Toplam ${total} kullanıcı`
                    }}
                />
            )}
        </div>
    );
};

export default UserList; 