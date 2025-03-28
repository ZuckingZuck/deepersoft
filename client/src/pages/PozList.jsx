import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Typography, Upload, Modal, Spin } from 'antd';
import { UploadOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../utils/api';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const PozList = () => {
    const [loading, setLoading] = useState(true);
    const [pozData, setPozData] = useState([]);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    useEffect(() => {
        fetchPozData();
    }, []);

    const fetchPozData = async () => {
        try {
            const response = await api.get('/api/poz');
            setPozData(response.data);
        } catch (error) {
            console.error('Pozlar alınırken hata:', error);
            message.error('Pozlar alınırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (file) => {
        try {
            setImportLoading(true);
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Excel verilerini API formatına dönüştür
                const formattedData = jsonData.map(row => {
                    // Fiyat değerlerini sayıya çevir
                    const price = typeof row['2025 REVİZE FİYAT'] === 'string' 
                        ? parseFloat(row['2025 REVİZE FİYAT'].replace('₺', '').replace(',', '.'))
                        : row['2025 REVİZE FİYAT'];

                    const contractorPrice = typeof row['2025 TAŞERON FİYAT'] === 'string'
                        ? parseFloat(row['2025 TAŞERON FİYAT'].replace('₺', '').replace(',', '.'))
                        : row['2025 TAŞERON FİYAT'];

                    return {
                        code: row['Kalem Kodu'],
                        name: row['İş Tipi Adı'],
                        priceType: row['Fiyat Tipi'],
                        price: isNaN(price) ? 0 : price,
                        contractorPrice: isNaN(contractorPrice) ? 0 : contractorPrice
                    };
                });

                // Verileri 100'er parça halinde gönder
                const chunkSize = 100;
                const chunks = [];
                for (let i = 0; i < formattedData.length; i += chunkSize) {
                    chunks.push(formattedData.slice(i, i + chunkSize));
                }

                // Her parçayı sırayla gönder
                for (let i = 0; i < chunks.length; i++) {
                    await api.post('/api/poz/bulk', { pozes: chunks[i] });
                    // İlerleme durumunu göster
                    message.loading(`Pozlar içe aktarılıyor... (${i + 1}/${chunks.length})`);
                }

                message.success('Pozlar başarıyla içe aktarıldı');
                setIsImportModalVisible(false);
                fetchPozData();
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Pozlar içe aktarılırken hata:', error);
            message.error('Pozlar içe aktarılırken bir hata oluştu');
        } finally {
            setImportLoading(false);
        }
    };

    const handleExport = () => {
        try {
            // Verileri Excel formatına dönüştür
            const exportData = pozData.map(poz => ({
                'Kalem Kodu': poz.code,
                'İş Tipi Adı': poz.name,
                'Fiyat Tipi': poz.priceType,
                '2025 REVİZE FİYAT': poz.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
                '2025 TAŞERON FİYAT': poz.contractorPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Pozlar');

            // Excel dosyasını indir
            XLSX.writeFile(wb, 'pozlar.xlsx');
            message.success('Pozlar başarıyla dışa aktarıldı');
        } catch (error) {
            console.error('Pozlar dışa aktarılırken hata:', error);
            message.error('Pozlar dışa aktarılırken bir hata oluştu');
        }
    };

    const columns = [
        {
            title: 'Kalem Kodu',
            dataIndex: 'code',
            key: 'code',
            sorter: (a, b) => a.code.localeCompare(b.code),
        },
        {
            title: 'İş Tipi Adı',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Fiyat Tipi',
            dataIndex: 'priceType',
            key: 'priceType',
        },
        {
            title: '2025 REVİZE FİYAT',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (price) => (
                <Text>{price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Text>
            ),
        },
        {
            title: '2025 TAŞERON FİYAT',
            dataIndex: 'contractorPrice',
            key: 'contractorPrice',
            sorter: (a, b) => a.contractorPrice - b.contractorPrice,
            render: (price) => (
                <Text>{price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Text>
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
                                <PlusOutlined className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <Title level={2} className="m-0 text-gray-800">Poz Listesi</Title>
                                <Text type="secondary">Tüm pozların listesi ve yönetimi</Text>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                type="primary"
                                icon={<UploadOutlined />}
                                onClick={() => setIsImportModalVisible(true)}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Pozları İçe Aktar
                            </Button>
                            <Button 
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Pozları Dışa Aktar
                            </Button>
                        </div>
                    </div>
                </div>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Table
                        columns={columns}
                        dataSource={pozData}
                        rowKey="_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Toplam ${total} poz`
                        }}
                    />
                </Card>
            </div>

            {/* İçe Aktarma Modalı */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <UploadOutlined className="text-green-500" />
                        <span>Pozları İçe Aktar</span>
                    </div>
                }
                open={isImportModalVisible}
                onCancel={() => setIsImportModalVisible(false)}
                footer={null}
            >
                {importLoading ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-600">Pozlar içe aktarılıyor, lütfen bekleyin...</p>
                    </div>
                ) : (
                    <Dragger
                        accept=".xlsx,.xls"
                        beforeUpload={(file) => {
                            handleImport(file);
                            return false;
                        }}
                        showUploadList={false}
                    >
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Excel dosyasını sürükleyip bırakın veya tıklayın
                        </p>
                        <p className="ant-upload-hint">
                            Sadece .xlsx veya .xls formatında dosya yükleyin
                        </p>
                    </Dragger>
                )}
            </Modal>
        </div>
    );
};

export default PozList; 