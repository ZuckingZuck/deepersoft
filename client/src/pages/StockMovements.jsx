import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin, message, Typography } from 'antd';
import { BankOutlined, UserOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;

const StockMovements = () => {
    const [loading, setLoading] = useState(true);
    const [movementData, setMovementData] = useState([]);

    useEffect(() => {
        fetchMovementData();
    }, []);

    const fetchMovementData = async () => {
        try {
            const response = await api.get('/api/stock/local/log');
            console.log('Stok hareketleri:', response.data);
            setMovementData(response.data);
        } catch (error) {
            console.error('Stok hareketleri alınırken hata:', error);
            message.error('Stok hareketleri alınırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tarih',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('tr-TR'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'İşlemi Yapan',
            dataIndex: ['creator', 'fullName'],
            key: 'creator',
            render: (text) => (
                <div className="flex items-center">
                    <UserOutlined className="mr-2 text-gray-500" />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Poz Kodu',
            dataIndex: ['poz', 'code'],
            key: 'code',
            sorter: (a, b) => a.poz.code.localeCompare(b.poz.code),
        },
        {
            title: 'Poz Adı',
            dataIndex: ['poz', 'name'],
            key: 'name',
            sorter: (a, b) => a.poz.name.localeCompare(b.poz.name),
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
            sorter: (a, b) => a.amount - b.amount,
            render: (amount) => (
                <Tag color={amount > 0 ? 'green' : 'red'}>
                    {amount > 0 ? '+' : ''}{amount.toLocaleString('tr-TR')}
                </Tag>
            ),
        },
        {
            title: 'Birim Fiyat',
            dataIndex: ['poz', 'price'],
            key: 'price',
            sorter: (a, b) => a.poz.price - b.poz.price,
            render: (price) => (
                <Text>{price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Text>
            ),
        },
        {
            title: 'Toplam Değer',
            key: 'totalValue',
            sorter: (a, b) => (a.amount * a.poz.price) - (b.amount * b.poz.price),
            render: (_, record) => (
                <Text>
                    {(record.amount * record.poz.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </Text>
            ),
        }
    ];

    if (loading) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-8">
                        <Spin size="large" />
                    </div>
                </Card>
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
                                <BankOutlined className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <Title level={2} className="m-0 text-gray-800">Stok Hareketleri</Title>
                                <Text type="secondary">Yerel depo stok hareketleri ve işlem geçmişi</Text>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                            <BankOutlined className="text-xl text-purple-600" />
                        </div>
                        <Title level={4} className="m-0 text-gray-800">Hareket Listesi</Title>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={movementData}
                        rowKey="_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Toplam ${total} hareket`
                        }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default StockMovements; 