import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin, message, Typography, Button, Modal, Form, Select, InputNumber } from 'antd';
import { SwapOutlined, UserOutlined, ShoppingCartOutlined, RollbackOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers } from '../redux/userSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const StockTransfer = () => {
    const [loading, setLoading] = useState(true);
    const [transferData, setTransferData] = useState([]);
    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
    const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
    const [localStocks, setLocalStocks] = useState([]);
    const [pozList, setPozList] = useState([]);
    const [transferForm] = Form.useForm();
    const [refundForm] = Form.useForm();
    const dispatch = useDispatch();
    const users = useSelector((state) => state.user.allUsers);
    const userStatus = useSelector((state) => state.user.userStatus);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userStatus === 'idle') {
                    await dispatch(fetchAllUsers()).unwrap();
                }
                await fetchTransferData();
                await fetchLocalStocks();
                await fetchPozList();
            } catch (error) {
                console.error('Veriler yüklenirken hata:', error);
                message.error('Veriler yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, userStatus]);

    const fetchLocalStocks = async () => {
        try {
            const response = await api.get('/api/stock/local');
            setLocalStocks(response.data);
        } catch (error) {
            console.error('Yerel stoklar alınırken hata:', error);
        }
    };

    const fetchPozList = async () => {
        try {
            const response = await api.get('/api/poz');
            setPozList(response.data);
        } catch (error) {
            console.error('Pozlar alınırken hata:', error);
        }
    };

    const fetchTransferData = async () => {
        try {
            const response = await api.get('/api/stock/transfer/log');
            console.log('Stok transferleri:', response.data);
            setTransferData(response.data);
        } catch (error) {
            console.error('Stok transferleri alınırken hata:', error);
            message.error('Stok transferleri alınırken bir hata oluştu');
        }
    };

    const handleTransfer = async (values) => {
        try {
            await api.post('/api/stock/transfer', values);
            message.success('Stok transferi başarıyla gerçekleştirildi');
            setIsTransferModalVisible(false);
            transferForm.resetFields();
            fetchTransferData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Stok transferi sırasında bir hata oluştu');
        }
    };

    const handleRefund = async (values) => {
        try {
            await api.post('/api/stock/refund', values);
            message.success('Stok iadesi başarıyla gerçekleştirildi');
            setIsRefundModalVisible(false);
            refundForm.resetFields();
            fetchTransferData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Stok iadesi sırasında bir hata oluştu');
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
            title: 'İşlem Tipi',
            dataIndex: 'transactionType',
            key: 'transactionType',
            render: (type) => (
                <Tag 
                    color={type === 'Satın Alım' ? 'green' : 'red'}
                    icon={type === 'Satın Alım' ? <ShoppingCartOutlined /> : <RollbackOutlined />}
                >
                    {type}
                </Tag>
            ),
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
            title: 'Transfer Edilen Kullanıcı',
            dataIndex: ['user', 'fullName'],
            key: 'user',
            render: (text) => (
                <div className="flex items-center">
                    <UserOutlined className="mr-2 text-blue-500" />
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
                <Tag color="blue">
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
                                <SwapOutlined className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <Title level={2} className="m-0 text-gray-800">Stok Transferleri</Title>
                                <Text type="secondary">Kullanıcılar arası stok transfer geçmişi</Text>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                onClick={() => setIsTransferModalVisible(true)}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Satın Alım Gir
                            </Button>
                            <Button 
                                type="primary"
                                danger
                                icon={<RollbackOutlined />}
                                onClick={() => setIsRefundModalVisible(true)}
                            >
                                İade Gir
                            </Button>
                        </div>
                    </div>
                </div>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <SwapOutlined className="text-xl text-blue-600" />
                        </div>
                        <Title level={4} className="m-0 text-gray-800">Transfer Listesi</Title>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={transferData}
                        rowKey="_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Toplam ${total} transfer`
                        }}
                    />
                </Card>
            </div>

            {/* Satın Alım Modalı */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <ShoppingCartOutlined className="text-green-500" />
                        <span>Yeni Satın Alım</span>
                    </div>
                }
                open={isTransferModalVisible}
                onCancel={() => {
                    setIsTransferModalVisible(false);
                    transferForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={transferForm}
                    onFinish={handleTransfer}
                    layout="vertical"
                >
                    <Form.Item
                        name="user"
                        label="Transfer Edilecek Kullanıcı"
                        rules={[{ required: true, message: 'Lütfen kullanıcı seçin' }]}
                    >
                        <Select placeholder="Kullanıcı seçin">
                            {users && users.length > 0 ? (
                                users.map(user => (
                                    <Option key={user._id} value={user._id}>{user.fullName}</Option>
                                ))
                            ) : (
                                <Option disabled>Kullanıcı listesi yükleniyor...</Option>
                            )}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="localStockId"
                        label="Stok Kalemi"
                        rules={[{ required: true, message: 'Lütfen stok kalemi seçin' }]}
                    >
                        <Select placeholder="Stok kalemi seçin">
                            {localStocks.map(stock => (
                                <Option key={stock._id} value={stock._id}>
                                    {`${stock.poz.code} - ${stock.poz.name} (Mevcut: ${stock.amount} ${stock.poz.unit})`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Miktar"
                        rules={[{ required: true, message: 'Lütfen miktar girin' }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => {
                            setIsTransferModalVisible(false);
                            transferForm.resetFields();
                        }}>
                            İptal
                        </Button>
                        <Button type="primary" htmlType="submit" className="bg-green-500 hover:bg-green-600">
                            Transfer Et
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* İade Modalı */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <RollbackOutlined className="text-red-500" />
                        <span>Yeni İade</span>
                    </div>
                }
                open={isRefundModalVisible}
                onCancel={() => {
                    setIsRefundModalVisible(false);
                    refundForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={refundForm}
                    onFinish={handleRefund}
                    layout="vertical"
                >
                    <Form.Item
                        name="refunder"
                        label="İade Eden Kullanıcı"
                        rules={[{ required: true, message: 'Lütfen kullanıcı seçin' }]}
                    >
                        <Select placeholder="Kullanıcı seçin">
                            {users && users.length > 0 ? (
                                users.map(user => (
                                    <Option key={user._id} value={user._id}>{user.fullName}</Option>
                                ))
                            ) : (
                                <Option disabled>Kullanıcı listesi yükleniyor...</Option>
                            )}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="poz"
                        label="Poz"
                        rules={[{ required: true, message: 'Lütfen poz seçin' }]}
                    >
                        <Select placeholder="Poz seçin">
                            {pozList.map(poz => (
                                <Option key={poz._id} value={poz._id}>
                                    {`${poz.code} - ${poz.name}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Miktar"
                        rules={[{ required: true, message: 'Lütfen miktar girin' }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => {
                            setIsRefundModalVisible(false);
                            refundForm.resetFields();
                        }}>
                            İptal
                        </Button>
                        <Button type="primary" danger htmlType="submit">
                            İade Et
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default StockTransfer; 