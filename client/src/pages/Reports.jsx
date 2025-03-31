import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, Space, Divider, Table, message } from 'antd';
import { DownloadOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../utils/api';

const Reports = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [fieldTypes, setFieldTypes] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [projects, setProjects] = useState([]);

  // Statüs seçenekleri
  const statusOptions = [
    { value: 'İşlemde', label: 'İşlemde' },
    { value: 'Onayda', label: 'Onayda' },
    { value: 'İncelendi', label: 'İncelendi' },
    { value: 'Montaj Tamam', label: 'Montaj Tamam' },
    { value: 'Tamamlandı', label: 'Tamamlandı' },
    { value: 'Islah ve Düzenleme', label: 'Islah ve Düzenleme' },
    { value: 'Beklemede', label: 'Beklemede' },
    { value: 'Arşivde', label: 'Arşivde' }
  ];

  useEffect(() => {
    // Şehirleri, alan tiplerini ve kullanıcıları yükle
    fetchFilterData();
    // İlk yüklemede tüm projeleri getir
    fetchProjects({});
  }, []);

  const fetchFilterData = async () => {
    try {
      // Sistem gereksinimlerini getir
      const sysResponse = await api.get('/api/req/sys');
      
      if (sysResponse.data) {
        // Şehir seçenekleri (clusterList'ten)
        if (sysResponse.data.clusterList && sysResponse.data.clusterList.length > 0) {
          // Şehir alanını bul ve tekrarlayanları kaldır
          const uniqueCities = [...new Set(sysResponse.data.clusterList.map(cluster => cluster.city))];
          setCities(uniqueCities.map(city => ({
            value: city,
            label: city
          })));
        }
        
        // Alan tipleri (fieldTypeList'ten)
        if (sysResponse.data.fieldTypeList && sysResponse.data.fieldTypeList.length > 0) {
          setFieldTypes(sysResponse.data.fieldTypeList.map(type => ({
            value: type.name,
            label: type.name
          })));
        }
      }

      // Taşeronları getir (Taşeron tipindeki kullanıcıları)
      try {
        const contractorsResponse = await api.get('/api/auth/users?userType=Taşeron');
        setContractors(contractorsResponse.data.map(user => ({
          value: user._id,
          label: user.fullName
        })));
      } catch (error) {
        console.error('Taşeronlar yüklenirken hata:', error);
        message.error('Taşeronlar yüklenemedi');
      }

      // Sorumluları getir (Supervisor tipindeki kullanıcıları)
      try {
        const supervisorsResponse = await api.get('/api/auth/users?userType=Supervisor');
        setSupervisors(supervisorsResponse.data.map(user => ({
          value: user._id,
          label: user.fullName
        })));
      } catch (error) {
        console.error('Sorumlular yüklenirken hata:', error);
        message.error('Sorumlular yüklenemedi');
      }
    } catch (error) {
      console.error('Filtre verileri yüklenirken hata:', error);
      message.error('Filtre seçenekleri yüklenirken bir hata oluştu.');
    }
  };

  const fetchProjects = async (filters) => {
    setLoading(true);
    try {
      // API'ye filtre değerlerini query string olarak gönder
      const response = await api.get('/api/report/project', { params: filters });
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Projeler yüklenirken hata:', error);
      message.error('Projeler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (values) => {
    // Boş değerleri filtrele
    const filters = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    fetchProjects(filters);
  };

  const handleReset = () => {
    form.resetFields();
    fetchProjects({});
  };

  const handleExcelDownload = () => {
    // Mevcut form değerlerini al
    const values = form.getFieldsValue();
    
    // Boş değerleri filtrele
    const filters = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    // Excel formatında indir
    filters.format = 'excel';
    
    // URL oluştur
    const queryString = new URLSearchParams(filters).toString();
    const url = `${api.defaults.baseURL}/api/report/project?${queryString}`;
    
    // Yeni pencerede aç ve indir
    window.open(url, '_blank');
  };

  // Poz raporu indirme fonksiyonu
  const handlePozExcelDownload = () => {
    // Mevcut form değerlerini al
    const values = form.getFieldsValue();
    
    // Boş değerleri filtrele
    const filters = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    // Excel formatında indir
    filters.format = 'excel';
    
    // URL oluştur
    const queryString = new URLSearchParams(filters).toString();
    const url = `${api.defaults.baseURL}/api/report/project-poz?${queryString}`;
    
    // Yeni pencerede aç ve indir
    window.open(url, '_blank');
    message.success('Poz raporu indiriliyor...');
  };

  // Tablo sütunları
  const columns = [
    {
      title: 'Proje Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name?.localeCompare(b.name)
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status?.localeCompare(b.status)
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      sorter: (a, b) => a.city?.localeCompare(b.city)
    },
    {
      title: 'Alan Tipi',
      dataIndex: 'fieldType',
      key: 'fieldType',
      sorter: (a, b) => a.fieldType?.localeCompare(b.fieldType)
    },
    {
      title: 'Cluster Adı',
      dataIndex: 'clusterName',
      key: 'clusterName',
      sorter: (a, b) => a.clusterName?.localeCompare(b.clusterName)
    },
    {
      title: 'Taşeron',
      dataIndex: ['contractor', 'fullName'],
      key: 'contractor',
      render: (text, record) => record.contractor?.fullName || '-'
    },
    {
      title: 'Sorumlu',
      dataIndex: ['supervisor', 'fullName'],
      key: 'supervisor',
      render: (text, record) => record.supervisor?.fullName || '-'
    },
    {
      title: 'DDO',
      dataIndex: 'ddo',
      key: 'ddo'
    },
    {
      title: 'HomePass',
      dataIndex: 'homePass',
      key: 'homePass'
    }
  ];

  return (
    <div className="reports-container">
      <Card title="Proje Raporları" className="filter-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilter}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>            
            <Form.Item name="city" label="Şehir" style={{ flex: '1 0 200px' }}>
              <Select
                placeholder="Şehir seçin"
                allowClear
                options={cities}
                loading={cities.length === 0}
                notFoundContent={cities.length === 0 ? 'Şehir bulunamadı' : null}
              />
            </Form.Item>
            
            <Form.Item name="fieldType" label="Alan Tipi" style={{ flex: '1 0 200px' }}>
              <Select
                placeholder="Alan tipi seçin"
                allowClear
                options={fieldTypes}
                loading={fieldTypes.length === 0}
                notFoundContent={fieldTypes.length === 0 ? 'Alan tipi bulunamadı' : null}
              />
            </Form.Item>
            
            <Form.Item name="contractor" label="Taşeron" style={{ flex: '1 0 200px' }}>
              <Select
                placeholder="Taşeron seçin"
                allowClear
                options={contractors}
                loading={contractors.length === 0}
                notFoundContent={contractors.length === 0 ? 'Taşeron bulunamadı' : null}
              />
            </Form.Item>
            
            <Form.Item name="supervisor" label="Sorumlu" style={{ flex: '1 0 200px' }}>
              <Select
                placeholder="Sorumlu seçin"
                allowClear
                options={supervisors}
                loading={supervisors.length === 0}
                notFoundContent={supervisors.length === 0 ? 'Sorumlu bulunamadı' : null}
              />
            </Form.Item>
            
            <Form.Item name="status" label="Durum" style={{ flex: '1 0 200px' }}>
              <Select
                placeholder="Durum seçin"
                allowClear
                options={statusOptions}
              />
            </Form.Item>
          </div>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
                Filtrele
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                Sıfırla
              </Button>
              <Button 
                type="primary" 
                onClick={handleExcelDownload} 
                icon={<DownloadOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Proje Raporu İndir
              </Button>
              <Button 
                type="primary" 
                onClick={handlePozExcelDownload} 
                icon={<DownloadOutlined />}
                style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
              >
                Poz Raporu İndir
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Divider />
      
      <Card className="results-card">
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} proje`
          }}
        />
      </Card>
    </div>
  );
};

export default Reports; 