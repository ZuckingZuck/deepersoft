import React, { useState } from 'react';
import { Modal, Upload, Button, message, Form, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemData } from '../redux/systemSlice';
import { bulkAddContractorPozPrices } from '../redux/contractorPozPriceSlice';
import * as XLSX from 'xlsx';

const ImportContractorPrices = ({ isOpen, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { userList } = useSelector(state => state.system);

    const handleUpload = async (file) => {
        try {
            setLoading(true);
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    // Form verilerini al
                    const values = await form.validateFields();
                    const { contractorId } = values;

                    // Excel verilerini API formatına dönüştür
                    const prices = jsonData.map(row => ({
                        code: row['Poz Kodu'],
                        price: parseFloat(row['Fiyat'])
                    }));

                    // API'ye gönder
                    await dispatch(bulkAddContractorPozPrices({ contractorId, prices })).unwrap();
                    
                    // Sistem verilerini güncelle
                    await dispatch(fetchSystemData()).unwrap();
                    
                    message.success('Fiyatlar başarıyla içe aktarıldı');
                    form.resetFields();
                    onClose();
                } catch (error) {
                    console.error('Excel yükleme hatası:', error);
                    message.error(error.message || 'Fiyatlar içe aktarılırken bir hata oluştu');
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Excel yükleme hatası:', error);
            message.error('Excel dosyası yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Fiyat İçe Aktar"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={() => {}}
            >
                <Form.Item
                    name="contractorId"
                    label="Taşeron"
                    rules={[{ required: true, message: 'Lütfen taşeron seçin' }]}
                >
                    <Select
                        placeholder="Taşeron seçin"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {userList
                            .filter(user => user.userType === 'Taşeron')
                            .map(user => (
                                <Select.Option key={user._id} value={user._id}>
                                    {user.fullName}
                                </Select.Option>
                            ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="file"
                    label="Excel Dosyası"
                    rules={[{ required: true, message: 'Lütfen Excel dosyası yükleyin' }]}
                >
                    <Upload
                        accept=".xlsx,.xls"
                        beforeUpload={(file) => {
                            handleUpload(file);
                            return false;
                        }}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />} loading={loading}>
                            Excel Dosyası Yükle
                        </Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ImportContractorPrices; 