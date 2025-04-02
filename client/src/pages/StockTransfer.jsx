import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Tag, Spin, message, Typography, Button, Modal, Form, Select, InputNumber, Divider } from 'antd';
import { SwapOutlined, UserOutlined, ShoppingCartOutlined, RollbackOutlined, PlusOutlined, FileOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers } from '../redux/userSlice';
import { fetchSystemData } from '../redux/systemSlice';
import FileUpload from '../components/FileUpload';
import cdnAdapter from '../utils/cdnAdapter';

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
    const { allUsers: users, userStatus } = useSelector((state) => state.user);
    const { userList: systemUsers, status: systemStatus } = useSelector((state) => state.system);
    const [documentUrl, setDocumentUrl] = useState('');
    const [refundDocumentUrl, setRefundDocumentUrl] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newTransfer, setNewTransfer] = useState({
        pozId: '',
        amount: 0,
        userId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (systemStatus === 'idle') {
                    await dispatch(fetchSystemData()).unwrap();
                }
                await Promise.all([
                    fetchTransferData(),
                    fetchLocalStocks(),
                    fetchPozList()
                ]);
            } catch (error) {
                console.error('Veriler yüklenirken hata:', error);
                message.error('Veriler yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, systemStatus]);

    useEffect(() => {
        console.log('Redux States:', { 
            users, 
            userStatus, 
            systemUsers, 
            systemStatus 
        });
    }, [users, userStatus, systemUsers, systemStatus]);

    const userOptions = useMemo(() => {
        const allUsers = [...(users || []), ...(systemUsers || [])];
        return allUsers.map(user => ({
            key: user._id,
            value: user._id,
            label: user.fullName
        }));
    }, [users, systemUsers]);

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

    const handleFileUploadSuccess = (url) => {
        console.log('Yüklenen belge URL:', url);
        setDocumentUrl(url);
        message.success('Belge başarıyla yüklendi');
    };

    const handleRefundFileUploadSuccess = (url) => {
        console.log('İade belge URL:', url);
        setRefundDocumentUrl(url);
        message.success('Belge başarıyla yüklendi');
    };

    const handleTransfer = async (values) => {
        try {
            const transferData = {
                ...values,
                documentUrl: documentUrl || null
            };
            
            console.log('Transfer işlemi başlatılıyor...');
            console.log('Form değerleri:', values);
            console.log('Belge URL:', documentUrl);
            console.log('Gönderilecek veri:', transferData);
            
            const response = await api.post('/api/stock/transfer', transferData);
            console.log('Transfer yanıtı:', response.data);
            
            message.success('Stok transferi başarıyla gerçekleştirildi');
            setIsTransferModalVisible(false);
            transferForm.resetFields();
            setDocumentUrl('');
            fetchTransferData();
        } catch (error) {
            console.error('Transfer hatası:', error);
            message.error(error.response?.data?.message || 'Stok transferi sırasında bir hata oluştu');
        }
    };

    const handleRefund = async (values) => {
        try {
            const refundData = {
                ...values,
                documentUrl: refundDocumentUrl || null
            };
            
            console.log('İade işlemi başlatılıyor...');
            console.log('Form değerleri:', values);
            console.log('Belge URL:', refundDocumentUrl);
            console.log('Gönderilecek veri:', refundData);
            
            const response = await api.post('/api/stock/refund', refundData);
            console.log('İade yanıtı:', response.data);
            
            message.success('Stok iadesi başarıyla gerçekleştirildi');
            setIsRefundModalVisible(false);
            refundForm.resetFields();
            setRefundDocumentUrl('');
            fetchTransferData();
        } catch (error) {
            console.error('İade hatası:', error);
            message.error(error.response?.data?.message || 'Stok iadesi sırasında bir hata oluştu');
        }
    };

    const handleAddTransfer = async (values) => {
        try {
            console.log('Yeni transfer işlemi başlatılıyor...');
            console.log('Form değerleri:', values);
            
            const response = await api.post('/api/stock/transfer', values);
            console.log('Transfer yanıtı:', response.data);
            
            message.success('Stok transferi başarıyla gerçekleştirildi');
            setIsAddModalVisible(false);
            setNewTransfer({
                pozId: '',
                amount: 0,
                userId: ''
            });
            fetchTransferData();
        } catch (error) {
            console.error('Transfer hatası:', error);
            message.error(error.response?.data?.message || 'Stok transferi sırasında bir hata oluştu');
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
            sorter: (a, b) => (a.poz?.code || '').localeCompare(b.poz?.code || ''),
            render: (_, record) => record.poz?.code || '-'
        },
        {
            title: 'Poz Adı',
            dataIndex: ['poz', 'name'],
            key: 'name',
            sorter: (a, b) => (a.poz?.name || '').localeCompare(b.poz?.name || ''),
            render: (_, record) => record.poz?.name || '-'
        },
        {
            title: 'Birim',
            dataIndex: ['poz', 'unit'],
            key: 'unit',
            render: (_, record) => record.poz?.unit || '-'
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
            sorter: (a, b) => (a.poz?.price || 0) - (b.poz?.price || 0),
            render: (_, record) => (
                <Text>
                    {(record.poz?.price || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </Text>
            ),
        },
        {
            title: 'Toplam Değer',
            key: 'totalValue',
            sorter: (a, b) => ((a.amount * (a.poz?.price || 0)) - (b.amount * (b.poz?.price || 0))),
            render: (_, record) => (
                <Text>
                    {(record.amount * (record.poz?.price || 0)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </Text>
            ),
        },
        {
            title: 'Belge',
            dataIndex: 'documentUrl',
            key: 'documentUrl',
            render: (url) => {
                console.log('Belge URL değeri:', url, '(type:', typeof url, ')');
                
                if (!url || url === "undefined" || url === "null") {
                    return <Tag color="red">Belge Yok</Tag>;
                }
                
                const documentUrl = String(url);
                console.log('String olarak URL:', documentUrl);
                
                try {
                    const fileUrl = cdnAdapter.getFileUrl(documentUrl);
                    console.log('Oluşturulan tam dosya URL:', fileUrl);
                    
                    return (
                        <Button 
                            type="link" 
                            icon={<FileOutlined />}
                            onClick={() => {
                                console.log('Belge açılıyor:', fileUrl);
                                window.open(fileUrl, '_blank');
                            }}
                        >
                            Belgeyi Görüntüle
                        </Button>
                    );
                } catch (error) {
                    console.error('URL dönüştürme hatası:', error);
                    return <Tag color="red">URL Hatası: {error.message}</Tag>;
                }
            }
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
                    setDocumentUrl('');
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
                        <Select 
                            placeholder="Kullanıcı seçin"
                            showSearch
                            loading={systemStatus === 'loading'}
                            options={userOptions}
                            filterOption={(input, option) => {
                                const searchText = normalizeText(input);
                                const optionText = normalizeText(`${option.label}`);
                                return optionText.includes(searchText);
                            }}
                        />
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

                    <Divider>Belge Yükleme</Divider>
                    
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Satın Alım Belgesi</label>
                        <FileUpload 
                            onSuccess={handleFileUploadSuccess} 
                            buttonText="Belge Yükle"
                            maxFileSize={5}
                        />
                        {documentUrl && (
                            <div className="mt-2 text-green-500 text-sm">
                                ✓ Belge yüklendi
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => {
                            setIsTransferModalVisible(false);
                            transferForm.resetFields();
                            setDocumentUrl('');
                        }}>
                            İptal
                        </Button>
                        <Button type="primary" htmlType="submit" className="bg-green-500 hover:bg-green-600">
                            Transfer Et
                        </Button>
                    </div>
                </Form>
            </Modal>

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
                    setRefundDocumentUrl('');
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
                        <Select 
                            placeholder="Kullanıcı seçin"
                            showSearch
                            loading={systemStatus === 'loading'}
                            options={userOptions}
                            filterOption={(input, option) => {
                                const searchText = normalizeText(input);
                                const optionText = normalizeText(`${option.label}`);
                                return optionText.includes(searchText);
                            }}
                        />
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

                    <Divider>Belge Yükleme</Divider>
                    
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">İade Belgesi</label>
                        <FileUpload 
                            onSuccess={handleRefundFileUploadSuccess} 
                            buttonText="Belge Yükle"
                            maxFileSize={5}
                        />
                        {refundDocumentUrl && (
                            <div className="mt-2 text-green-500 text-sm">
                                ✓ Belge yüklendi
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => {
                            setIsRefundModalVisible(false);
                            refundForm.resetFields();
                            setRefundDocumentUrl('');
                        }}>
                            İptal
                        </Button>
                        <Button type="primary" danger htmlType="submit">
                            İade Et
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <SwapOutlined className="text-blue-500" />
                        <span>Yeni Transfer</span>
                    </div>
                }
                open={isAddModalVisible}
                onOk={handleAddTransfer}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    setNewTransfer({
                        pozId: '',
                        amount: 0,
                        userId: ''
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
                            value={newTransfer.pozId}
                            onChange={(value) => setNewTransfer({ ...newTransfer, pozId: value })}
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
                            Transfer Edilecek Kullanıcı
                        </label>
                        <Select
                            showSearch
                            placeholder="Kullanıcı seçin"
                            value={newTransfer.userId}
                            onChange={(value) => setNewTransfer({ ...newTransfer, userId: value })}
                            className="w-full"
                            loading={systemStatus === 'loading'}
                            options={userOptions}
                            filterOption={(input, option) => {
                                const searchText = normalizeText(input);
                                const optionText = normalizeText(`${option.label}`);
                                return optionText.includes(searchText);
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Miktar
                        </label>
                        <InputNumber
                            value={newTransfer.amount}
                            onChange={(value) => setNewTransfer({ ...newTransfer, amount: value })}
                            min={1}
                            className="w-full"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StockTransfer; 