import React, { useState } from 'react';
import { Modal, Upload, Form, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../utils/api';
import * as XLSX from 'xlsx';

const ImportPozModal = ({ isOpen, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);

    const handleUpload = async (file) => {
        try {
            setLoading(true);
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Excel verilerini API formatına dönüştür
                const formattedData = jsonData.map(row => ({
                    code: row['Kalem Kodu'],
                    name: row['İş Tipi Adı'],
                    priceType: row['Fiyat Tipi'],
                    price: typeof row['Fiyat'] === 'string' 
                        ? parseFloat(row['Fiyat'].replace('₺', '').replace(',', '.'))
                        : row['Fiyat']
                }));

                // Verileri 100'er parça halinde gönder
                const chunkSize = 100;
                const chunks = [];
                for (let i = 0; i < formattedData.length; i += chunkSize) {
                    chunks.push(formattedData.slice(i, i + chunkSize));
                }

                // Her parçayı sırayla gönder
                for (let i = 0; i < chunks.length; i++) {
                    await api.post('/api/poz/bulk', { pozes: chunks[i] });
                    message.loading(`Pozlar içeri aktarılıyor... (${i + 1}/${chunks.length})`);
                }

                message.success('Pozlar başarıyla içeri aktarıldı');
                form.resetFields();
                setFileList([]);
                onSuccess();
                onClose();
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Pozlar içeri aktarılırken hata:', error);
            message.error('Pozlar içeri aktarılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        onRemove: () => {
            setFileList([]);
        },
        beforeUpload: (file) => {
            setFileList([file]);
            return false;
        },
        fileList,
    };

    return (
        <Modal
            title="Pozları İçeri Aktar"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={() => {
                    if (fileList.length === 0) {
                        message.error('Lütfen bir Excel dosyası seçin');
                        return;
                    }
                    handleUpload(fileList[0]);
                }}
            >
                <Form.Item label="Excel Dosyası">
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Excel Dosyası Seç</Button>
                    </Upload>
                    <div className="mt-2 text-gray-500 text-sm">
                        Excel dosyasında şu kolonlar olmalıdır:
                        <ul className="list-disc list-inside mt-1">
                            <li>Kalem Kodu</li>
                            <li>İş Tipi Adı</li>
                            <li>Fiyat Tipi</li>
                            <li>Fiyat</li>
                        </ul>
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        İçeri Aktar
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ImportPozModal; 