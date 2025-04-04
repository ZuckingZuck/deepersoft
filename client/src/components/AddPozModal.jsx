import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Form, Select, InputNumber, Empty, Spin, message, Space, Button } from 'antd';

const AddPozModal = ({ isOpen, onClose, onAdd, loading }) => {
    const [form] = Form.useForm();
    const { pozList, status } = useSelector(state => state.system);
    const user = useSelector(state => state.user.user);
    const [selectedPoz, setSelectedPoz] = useState(null);
    console.log(pozList);
    const handleSubmit = async (values) => {
        const pozData = {
            pozId: values.poz,
            amount: values.amount,
            contractorPrice: user.userType === 'Taşeron' ? selectedPoz.price : values.contractorPrice
        };
        await onAdd(pozData);
        form.resetFields();
        setSelectedPoz(null);
    };

    const handlePozChange = (value) => {
        const poz = pozList.find(p => p._id === value);
        setSelectedPoz(poz);
    };

    const renderPozSelect = () => {
        if (status === 'loading') {
            return (
                <div className="text-center py-4">
                    <Spin tip="Pozlar yükleniyor..." />
                </div>
            );
        }

        if (!pozList || pozList.length === 0) {
            return (
                <Empty 
                    description="Poz listesi bulunamadı"
                    className="py-4"
                />
            );
        }

        return (
            <Select
                placeholder="Poz seçiniz"
                onChange={handlePozChange}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
            >
                {pozList.map(poz => (
                    <Select.Option key={poz._id} value={poz._id}>
                        {poz.name} - {poz.unit} - {user.userType === 'Taşeron' ? 
                            (poz.price || 0).toLocaleString('tr-TR') + ' ₺' : 
                            (poz.originalPrice || 0).toLocaleString('tr-TR') + ' ₺'}
                    </Select.Option>
                ))}
            </Select>
        );
    };

    return (
        <Modal
            title="Poz Ekle"
            open={isOpen}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="poz"
                    label="Poz"
                    rules={[{ required: true, message: "Lütfen poz seçiniz" }]}
                >
                    {renderPozSelect()}
                </Form.Item>

                {selectedPoz && (
                    <>
                        <Form.Item
                            name="amount"
                            label="Miktar"
                            rules={[{ required: true, message: "Lütfen miktar giriniz" }]}
                        >
                            <InputNumber 
                                min={0} 
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        {user.userType === 'Sistem Yetkilisi' && (
                            <Form.Item
                                name="contractorPrice"
                                label="Taşeron Fiyatı"
                                rules={[{ required: true, message: "Lütfen taşeron fiyatını giriniz" }]}
                            >
                                <InputNumber 
                                    min={0} 
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        )}

                        {user.userType === 'Taşeron' && selectedPoz.price && (
                            <div className="text-sm text-gray-500">
                                Taşeron Fiyatı: {selectedPoz.price.toLocaleString('tr-TR')} ₺
                            </div>
                        )}
                    </>
                )}

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Ekle
                        </Button>
                        <Button onClick={onClose}>
                            İptal
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPozModal; 