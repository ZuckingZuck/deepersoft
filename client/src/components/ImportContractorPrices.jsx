import React, { useState, useEffect } from 'react';
import { Modal, Upload, Form, Select, message, Button, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers } from '../redux/userSlice';
import api from '../utils/api';
import * as XLSX from 'xlsx';

const CHUNK_SIZE = 100; // Her seferde gönderilecek veri sayısı

const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

const ImportContractorPrices = ({ isOpen, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [progress, setProgress] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [currentChunk, setCurrentChunk] = useState(0);
    const { contractors, status } = useSelector(state => state.user);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchAllUsers());
        }
    }, [dispatch, isOpen]);

    const processChunk = async (chunk, contractorId) => {
        try {
            await api.post('/api/contractor-poz-price/bulk', {
                contractorId,
                prices: chunk
            });
            setCurrentChunk(prev => prev + 1);
            setProgress(Math.round((currentChunk + 1) * 100 / totalChunks));
        } catch (error) {
            console.error('Chunk yükleme hatası:', error);
            throw error;
        }
    };

    const handleUpload = async (file) => {
        try {
            setLoading(true);
            setProgress(0);
            setCurrentChunk(0);
            
            const data = await readExcelFile(file);
            
            // Excel verilerini doğru formata dönüştür
            const formattedData = data.map(row => {
                let price = row['Taşeron Fiyat'];
                
                // Eğer fiyat string ise ₺ ve virgülü temizle
                if (typeof price === 'string') {
                    price = price.replace('₺', '').replace(',', '.');
                }
                
                // Fiyatı sayıya çevir
                price = parseFloat(price);
                
                return {
                    code: row['Kalem Kodu'],
                    price: price
                };
            });

            // Boş veya geçersiz verileri filtrele
            const validData = formattedData.filter(item => 
                item.code && 
                !isNaN(item.price) && 
                item.price >= 0
            );

            if (validData.length === 0) {
                message.error('Geçerli veri bulunamadı');
                return;
            }

            // Verileri chunk'lara böl
            const chunks = [];
            for (let i = 0; i < validData.length; i += CHUNK_SIZE) {
                chunks.push(validData.slice(i, i + CHUNK_SIZE));
            }
            setTotalChunks(chunks.length);

            // Her chunk'ı sırayla işle
            const contractorId = form.getFieldValue('contractorId');
            for (const chunk of chunks) {
                await processChunk(chunk, contractorId);
            }

            message.success('Fiyatlar başarıyla içe aktarıldı');
            setIsOpen(false);
            form.resetFields();
            onSuccess?.();
        } catch (error) {
            console.error('Excel yükleme hatası:', error);
            message.error('Excel dosyası yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
            setProgress(0);
            setCurrentChunk(0);
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
            title="Taşeron Fiyatlarını İçeri Aktar"
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
                <Form.Item
                    name="contractorId"
                    label="Taşeron"
                    rules={[{ required: true, message: 'Lütfen bir taşeron seçin' }]}
                >
                    <Select 
                        placeholder="Taşeron seçin"
                        loading={status === 'loading'}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {contractors.map(contractor => (
                            <Select.Option key={contractor._id} value={contractor._id}>
                                {contractor.fullName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Excel Formatı"
                    required
                >
                    <div className="text-sm text-gray-500">
                        <p>Excel dosyanız aşağıdaki sütunları içermelidir:</p>
                        <ul className="list-disc ml-4 mt-1">
                            <li>Kalem Kodu</li>
                            <li>Taşeron Fiyat</li>
                        </ul>
                        <p className="mt-2">Örnek format:</p>
                        <pre className="bg-gray-100 p-2 rounded mt-1">
                            Kalem Kodu    Taşeron Fiyat
                            ALT-SOL34     ₺113,05
                        </pre>
                    </div>
                </Form.Item>

                <Form.Item label="Excel Dosyası">
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Excel Dosyası Seç</Button>
                    </Upload>
                </Form.Item>

                {loading && (
                    <div className="mb-4">
                        <Progress percent={progress} status="active" />
                        <div className="text-sm text-gray-500 mt-2">
                            Yükleniyor... {currentChunk}/{totalChunks} parça
                        </div>
                    </div>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        İçeri Aktar
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ImportContractorPrices; 