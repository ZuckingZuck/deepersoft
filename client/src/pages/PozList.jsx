import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Typography, Upload, Modal, Spin } from 'antd';
import { UploadOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPozList } from '../redux/systemSlice';
import AddPozModal from '../components/AddPozModal';
import ImportContractorPrices from '../components/ImportContractorPrices';
import ImportPozModal from '../components/ImportPozModal';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const PozList = () => {
    const dispatch = useDispatch();
    const { pozList, status } = useSelector(state => state.system);
    const user = useSelector(state => state.user.user);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImportPozModalOpen, setIsImportPozModalOpen] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchPozList());
    }, [dispatch]);

    const handleAddPoz = async (pozData) => {
        try {
            await dispatch(fetchPozList());
            message.success('Poz başarıyla eklendi');
            setIsAddModalOpen(false);
        } catch (error) {
            message.error('Poz eklenirken bir hata oluştu');
        }
    };

    const handleImportSuccess = () => {
        message.success('Fiyatlar başarıyla içeri aktarıldı');
    };

    const handleExport = () => {
        try {
            // Verileri Excel formatına dönüştür
            const exportData = pozList.map(poz => ({
                'Kalem Kodu': poz.code,
                'İş Tipi Adı': poz.name,
                'Fiyat Tipi': poz.priceType,
                'Fiyat': poz.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
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
            title: 'Fiyat',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (price) => (
                <Text>{price?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Text>
            ),
        }
    ];

    if (status === 'loading') {
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
                            {user.userType === 'Sistem Yetkilisi' && (
                                <>
                                    <Button 
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        onClick={() => setIsImportModalOpen(true)}
                                        className="bg-green-500 hover:bg-green-600"
                                    >
                                        Taşeron Fiyatlarını İçeri Aktar
                                    </Button>
                                    <Button 
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        onClick={() => setIsImportPozModalOpen(true)}
                                        className="bg-blue-500 hover:bg-blue-600"
                                    >
                                        Pozları İçeri Aktar
                                    </Button>
                                </>
                            )}
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
                        dataSource={pozList}
                        rowKey="_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Toplam ${total} poz`
                        }}
                        loading={status === 'loading'}
                    />
                </Card>
            </div>

            <AddPozModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddPoz}
            />

            <ImportContractorPrices
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={handleImportSuccess}
            />

            <ImportPozModal
                isOpen={isImportPozModalOpen}
                onClose={() => setIsImportPozModalOpen(false)}
                onSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default PozList;