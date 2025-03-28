import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Table, Tag, Spin, message, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const UserProfile = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const user = useSelector((state) => state.user.user);
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get(`/api/req/user/${user.id}`);
            console.log('Kullanıcı verisi:', response.data);
            setUserData(response.data);
        } catch (error) {
            console.error('Kullanıcı bilgileri alınırken hata:', error);
            message.error('Kullanıcı bilgileri alınırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const stockColumns = [
        {
            title: 'Poz Kodu',
            dataIndex: ['poz', 'code'],
            key: 'code',
        },
        {
            title: 'Poz Adı',
            dataIndex: ['poz', 'name'],
            key: 'name',
        },
        {
            title: 'Birim',
            dataIndex: ['poz', 'unit'],
            key: 'unit',
        },
        {
            title: 'Miktar',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Tag color={amount > 0 ? 'green' : 'red'}>
                    {amount.toLocaleString('tr-TR')}
                </Tag>
            ),
        }
    ];

    const transactionColumns = [
        {
            title: 'Tarih',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('tr-TR'),
        },
        {
            title: 'İşlem Tipi',
            dataIndex: 'transactionType',
            key: 'transactionType',
            render: (type) => (
                <Tag color={type === 'Satın Alım' ? 'green' : 'red'}>
                    {type}
                </Tag>
            ),
        },
        {
            title: 'Poz',
            dataIndex: ['poz', 'name'],
            key: 'poz',
        },
        {
            title: 'Miktar',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Tag color={amount > 0 ? 'green' : 'red'}>
                    {amount.toLocaleString('tr-TR')}
                </Tag>
            ),
        },
        {
            title: 'Depo',
            dataIndex: 'base',
            key: 'base',
        }
    ];

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <Spin tip="Kullanıcı bilgileri yükleniyor..." />
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <Text type="danger">Kullanıcı bulunamadı</Text>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-full mr-4">
                                <UserOutlined className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <Title level={2} className="m-0 text-gray-800">Profil Bilgileri</Title>
                                <Text type="secondary">Kişisel bilgilerinizi ve stok durumunuzu görüntüleyin</Text>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={8}>
                        <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="bg-green-100 p-2 rounded-full mr-3">
                                    <UserOutlined className="text-xl text-green-600" />
                                </div>
                                <Title level={4} className="m-0 text-gray-800">Kişisel Bilgiler</Title>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-32 text-gray-500">Ad Soyad:</div>
                                    <div className="font-medium">{userData.user.fullName}</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-32 text-gray-500">Kullanıcı Adı:</div>
                                    <div className="font-medium">{userData.user.userName}</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-32 text-gray-500">E-posta:</div>
                                    <div className="font-medium">{userData.user.email}</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-32 text-gray-500">Telefon:</div>
                                    <div className="font-medium">{userData.user.phone}</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-32 text-gray-500">Kullanıcı Tipi:</div>
                                    <Tag color={userData.user.userType === 'Supervisor' ? 'blue' : 'green'}>
                                        {userData.user.userType}
                                    </Tag>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-32 text-gray-500">Durum:</div>
                                    <Tag color={userData.user.status === 'Aktif' ? 'success' : 'error'}>
                                        {userData.user.status}
                                    </Tag>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={16}>
                        <Card className="shadow-sm hover:shadow-md transition-shadow mb-6">
                            <div className="flex items-center mb-4">
                                <div className="bg-purple-100 p-2 rounded-full mr-3">
                                    <BankOutlined className="text-xl text-purple-600" />
                                </div>
                                <Title level={4} className="m-0 text-gray-800">Stok Durumu</Title>
                            </div>
                            <Table
                                columns={stockColumns}
                                dataSource={userData.userStock}
                                rowKey="_id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Toplam ${total} kayıt`
                                }}
                            />
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="bg-orange-100 p-2 rounded-full mr-3">
                                    <BankOutlined className="text-xl text-orange-600" />
                                </div>
                                <Title level={4} className="m-0 text-gray-800">Stok Hareketleri</Title>
                            </div>
                            <Table
                                columns={transactionColumns}
                                dataSource={userData.userTransactions}
                                rowKey="_id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Toplam ${total} hareket`
                                }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default UserProfile; 