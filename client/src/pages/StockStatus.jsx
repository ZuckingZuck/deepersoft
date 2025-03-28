import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin, message, Typography, Button, Modal, Form, Input, InputNumber, Select } from 'antd';
import { BankOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

const StockStatus = () => {
    const [loading, setLoading] = useState(true);
    const [stockData, setStockData] = useState([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newStock, setNewStock] = useState({
        pozId: '',
        quantity: 0
    });
    const [pozList, setPozList] = useState([]);

    useEffect(() => {
        fetchStockData();
        fetchPozList();
    }, []);

    const fetchStockData = async () => {
        try {
            const response = await api.get('/api/stock/local');
            console.log('Stok verisi:', response.data);
            setStockData(response.data);
        } catch (error) {
            console.error('Stok bilgileri alınırken hata:', error);
            message.error('Stok bilgileri alınırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchPozList = async () => {
        try {
            const response = await api.get('/api/poz');
            // Sadece priceType'ı 'M' içeren pozları filtrele
            const filteredPozs = response.data.filter(poz => poz.priceType.includes('M'));
            setPozList(filteredPozs);
        } catch (error) {
            console.error('Pozlar alınırken hata:', error);
            message.error('Pozlar alınırken bir hata oluştu');
        }
    };

    const handleAddStock = async () => {
        try {
            await api.post('/api/stock', newStock);
            message.success('Stok başarıyla eklendi');
            setIsAddModalVisible(false);
            setNewStock({
                pozId: '',
                quantity: 0
            });
            fetchStockData();
        } catch (error) {
            console.error('Stok eklenirken hata:', error);
            message.error('Stok eklenirken bir hata oluştu');
        }
    };

    // Türkçe karakterleri normalize eden fonksiyon
    const normalizeText = (text) => {
        return text
            .toUpperCase()
            .replace(/İ/g, 'I')
            .replace(/Ğ/g, 'G')
            .replace(/Ü/g, 'U')
            .replace(/Ş/g, 'S')
            .replace(/Ö/g, 'O')
            .replace(/Ç/g, 'C');
    };

    const columns = [
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
                    {amount.toLocaleString('tr-TR')}
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
                                <Title level={2} className="m-0 text-gray-800">Stok Durumu</Title>
                                <Text type="secondary">Yerel depo stok durumu ve değerleri</Text>
                            </div>
                        </div>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setIsAddModalVisible(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Stok Ekle
                        </Button>
                    </div>
                </div>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                            <BankOutlined className="text-xl text-purple-600" />
                        </div>
                        <Title level={4} className="m-0 text-gray-800">Stok Listesi</Title>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={stockData}
                        rowKey="_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Toplam ${total} kayıt`
                        }}
                    />
                </Card>
            </div>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <PlusOutlined className="text-green-500" />
                        <span>Yeni Stok Ekle</span>
                    </div>
                }
                open={isAddModalVisible}
                onOk={handleAddStock}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    setNewStock({
                        pozId: '',
                        quantity: 0
                    });
                }}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Poz
                        </label>
                        <Select
                            showSearch
                            placeholder="Poz seçin"
                            value={newStock.pozId}
                            onChange={(value) => setNewStock({ ...newStock, pozId: value })}
                            className="w-full"
                            filterOption={(input, option) => {
                                const searchText = normalizeText(input);
                                const optionText = normalizeText(`${option.children}`);
                                return optionText.includes(searchText);
                            }}
                        >
                            {pozList.map(poz => (
                                <Select.Option key={poz._id} value={poz._id}>
                                    {poz.code} - {poz.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Miktar
                        </label>
                        <InputNumber
                            value={newStock.quantity}
                            onChange={(value) => setNewStock({ ...newStock, quantity: value })}
                            min={0}
                            className="w-full"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StockStatus; 