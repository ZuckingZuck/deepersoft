import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Form, Select, InputNumber, Empty, Spin, message } from 'antd';
import api from '../utils/api';

const AddPozModal = ({ isOpen, onClose, onAdd, loading }) => {
    const [form] = Form.useForm();
    const [selectedPoz, setSelectedPoz] = useState(null);
    const [amount, setAmount] = useState(1);
    const { pozList, status } = useSelector((state) => state.system);

    const handleSubmit = () => {
        if (!selectedPoz) {
            message.error('Lütfen bir poz seçin');
            return;
        }

        onAdd({
            poz: selectedPoz,
            amount: amount
        });
    };

    const filterOption = (input, option) => {
        if (!option || !option.children) return false;
        
        // option.children bir string değilse, string'e çevir
        const searchText = String(option.children).toLowerCase();
        const searchInput = input.toLowerCase();
        
        return searchText.includes(searchInput);
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
                showSearch
                placeholder="Poz seçiniz"
                optionFilterProp="children"
                onChange={(value) => {
                    const poz = pozList.find(p => p._id === value);
                    setSelectedPoz(poz);
                }}
                filterOption={filterOption}
            >
                {pozList.map(poz => (
                    <Select.Option key={poz._id} value={poz._id}>
                        {poz.code} - {poz.name}
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
            onOk={handleSubmit}
            okText="Ekle"
            cancelText="İptal"
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Poz Seçiniz">
                    {renderPozSelect()}
                </Form.Item>

                {selectedPoz && (
                    <>
                        <div className="selected-poz-details">
                            <p><strong>Poz Kodu:</strong> {selectedPoz.code}</p>
                            <p><strong>Poz Adı:</strong> {selectedPoz.name}</p>
                            <p><strong>Birim:</strong> {selectedPoz.unit}</p>
                            <p><strong>Fiyat:</strong> {selectedPoz.price}</p>
                            <p><strong>Taşeron Fiyatı:</strong> {selectedPoz.contractorPrice}</p>
                        </div>
                    </>
                )}

                <Form.Item label="Miktar">
                    <InputNumber
                        min={1}
                        value={amount}
                        onChange={setAmount}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPozModal; 