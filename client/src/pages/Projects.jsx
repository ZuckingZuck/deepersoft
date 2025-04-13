import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProjects } from "../redux/projectSlice";
import { 
  Table, 
  Tooltip, 
  Button, 
  message, 
  Tag, 
  Card, 
  Space, 
  Tabs, 
  Badge, 
  Avatar, 
  Typography,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Divider,
  Popover
} from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  PlusOutlined, 
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ProjectOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import api from "../utils/api";
import moment from "moment";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const calculateElapsedTime = (createdAt) => {
  const startDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - startDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Bugün";
  if (diffInDays === 1) return "Dün";
  return `${diffInDays} gün`;
};

// Status URL parametrelerini veritabanı değerleriyle eşleştiren obje
const statusMapping = {
  'islemde': 'İşlemde',
  'onayda': 'Onayda',
  'incelendi': 'İncelendi',
  'montaj-tamam': 'Montaj Tamam',
  'tamamlandi': 'Tamamlandı',
  'islah-duzenleme': 'Islah ve Düzenleme',
  'beklemede': 'Beklemede',
  'arsivde': 'Arşivde'
};

// Durum renk ve ikonları
const statusConfig = {
  'İşlemde': { color: 'blue', icon: <ClockCircleOutlined /> },
  'Onayda': { color: 'cyan', icon: <ClockCircleOutlined /> },
  'İncelendi': { color: 'purple', icon: <CheckCircleOutlined /> },
  'Montaj Tamam': { color: 'geekblue', icon: <CheckCircleOutlined /> },
  'Tamamlandı': { color: 'green', icon: <CheckCircleOutlined /> },
  'Islah ve Düzenleme': { color: 'orange', icon: <ClockCircleOutlined /> },
  'Beklemede': { color: 'gold', icon: <ClockCircleOutlined /> },
  'Arşivde': { color: 'gray', icon: <CheckCircleOutlined /> }
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex flex-col items-center">
      <Badge count={value} className="mb-2">
        <div className={`p-3 rounded-xl bg-${color}-50`}>
          {icon}
        </div>
      </Badge>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  </div>
);

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "islemde";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.project);
  const user = useSelector((state) => state.user.user);
  const [searchForm] = Form.useForm();
  const [searchVisible, setSearchVisible] = useState(false);
  const [tableData, setTableData] = useState([]);

  // Yetki kontrolü
  const canCreateProject = user && (user.userType === 'Sistem Yetkilisi' || user.userType === 'Supervisor');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects) {
      let filteredData = [...projects];
      const dbStatus = statusMapping[statusParam] || 'İşlemde';
      filteredData = filteredData.filter(project => project.status === dbStatus);
      setTableData(filteredData);
    }
  }, [projects, statusParam]);

  const handleSearch = async (values) => {
    setSearchVisible(true);
    try {
      // URL parametrelerini oluştur
      const params = new URLSearchParams();
      Object.keys(values).forEach(key => {
        if (values[key]) {
          if (key === 'startDate' || key === 'endDate') {
            params.append(key, values[key].format('YYYY-MM-DD'));
          } else {
            params.append(key, values[key]);
          }
        }
      });

      // API'ye istek at
      const response = await api.get(`/api/project/search?${params.toString()}`);
      setTableData(response.data);
      setSearchVisible(false);
      searchForm.resetFields();
    } catch (error) {
      message.error('Arama sırasında bir hata oluştu');
      console.error('Arama hatası:', error);
    }
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams(new URLSearchParams());
  };

  // Tab değiştiğinde URL parametresini güncelle
  const handleTabChange = (key) => {
    setSearchParams({ status: key });
  };

  // Başlık için görünen durum metnini belirle
  const getDisplayStatus = () => {
    return statusMapping[statusParam] || 'İşlemde';
  };

  // Durum için renk ve ikon ata
  const getStatusTag = (status) => {
    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {status}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Proje Bilgileri",
      key: "projectInfo",
      width: 280,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            <div className="flex items-center mb-1">
              <span className="font-semibold mr-2">DDO:</span> {record.ddo}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Tellcordia:</span> {record.tellcordiaNo}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Konum",
      key: "location",
      width: 180,
      render: (_, record) => (
        <div>
          <div className="flex items-center mb-1">
            <EnvironmentOutlined className="mr-1 text-blue-500" /> 
            <span>{record.city}</span>
          </div>
          <div className="text-xs text-gray-500">
            <div className="mb-1"><span className="font-semibold">Öbek:</span> {record.clusterName}</div>
            <div><span className="font-semibold">Saha:</span> {record.fieldName} ({record.fieldType})</div>
          </div>
        </div>
      ),
    },
    {
      title: "Sorumlular",
      key: "responsibles",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div className="flex items-center">
            <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500 mr-2" />
            <div>
              <div className="text-xs font-semibold">Supervisor</div>
              <div>{record.supervisor && record.supervisor.fullName ? record.supervisor.fullName : "Atanmamış"}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Avatar size="small" icon={<TeamOutlined />} className="bg-green-500 mr-2" />
            <div>
              <div className="text-xs font-semibold">Taşeron</div>
              <div>{record.contractor && record.contractor.fullName ? record.contractor.fullName : "Atanmamış"}</div>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Tarihler",
      key: "dates",
      width: 150,
      render: (_, record) => (
        <div>
          <div className="flex items-center mb-2">
            <ClockCircleOutlined className="mr-2 text-blue-500" />
            <div>
              <div className="text-xs">Başlangıç</div>
              <div>{new Date(record.createdAt).toLocaleDateString("tr-TR")}</div>
            </div>
          </div>
          <Tag color="blue">{calculateElapsedTime(record.createdAt)}</Tag>
        </div>
      ),
    },
    {
      title: "Kazanç Bilgileri",
      key: "priceInfo",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-xs text-gray-500 mt-1">
            <div className="flex items-center mb-1">
              <span className="font-semibold mr-2">Kazanç:</span> {record.totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Taşeron Kazanç:</span> {record.totalContractorPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => navigate(`/projects/${record._id}`)}
          size="middle"
          className="bg-blue-500 hover:bg-blue-600"
        >
          Detay
        </Button>
      ),
    },
  ];

  // Durumları tab olarak göster
  const statusTabs = Object.entries(statusMapping).map(([key, value]) => {
    const config = statusConfig[value] || {};
    return (
      <TabPane 
        tab={
          <span>
            {config.icon} {value}
          </span>
        } 
        key={key}
      />
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <Card className="shadow-lg rounded-2xl border-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl mr-4">
              <ProjectOutlined className="text-2xl text-blue-600" />
            </div>
            <Title level={2} className="m-0 text-gray-800">Projeler</Title>
          </div>
          <Space>
            <Button 
              icon={<SearchOutlined />}
              className="rounded-lg hover:bg-blue-50"
              onClick={() => navigate('/projects/search')}
            >
              Detaylı Arama
            </Button>
            {canCreateProject && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/projects/new')}
                size="large"
                className="bg-blue-500 hover:bg-blue-600 shadow-md rounded-lg"
              >
                Yeni Proje Ekle
              </Button>
            )}
          </Space>
        </div>

        <Tabs 
          activeKey={statusParam} 
          onChange={handleTabChange}
          type="card"
          className="mb-4 rounded-lg overflow-hidden"
        >
          {statusTabs}
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" tip="Projeler yükleniyor..." />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <InfoCircleOutlined className="text-4xl text-gray-400 mb-4" />
            <Text type="secondary" className="text-lg">
              Bu durumda herhangi bir proje bulunamadı.
            </Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="_id"
            bordered={false}
            loading={loading}
            pagination={{ 
              pageSize: 10, 
              position: ["bottomCenter"],
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} proje`,
              className: "mt-4"
            }}
            size="middle"
            scroll={{ x: 1100 }}
            rowClassName="hover:bg-blue-50 transition-colors"
            className="rounded-lg overflow-hidden"
          />
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center">
            <SearchOutlined className="text-blue-500 mr-2" />
            <span>Arama ve Filtreleme</span>
          </div>
        }
        open={searchVisible}
        onCancel={() => setSearchVisible(false)}
        footer={null}
        className="rounded-lg"
        width={800}
      >
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={searchParams}
          className="mt-4"
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="name" label="Proje Adı">
                <Input placeholder="Proje adına göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Durum">
                <Select placeholder="Duruma göre filtrele" allowClear className="rounded-lg">
                  <Option value="İşlemde">İşlemde</Option>
                  <Option value="Onayda">Onayda</Option>
                  <Option value="İncelendi">İncelendi</Option>
                  <Option value="Montaj Tamam">Montaj Tamam</Option>
                  <Option value="Tamamlandı">Tamamlandı</Option>
                  <Option value="Islah ve Düzenleme">Islah ve Düzenleme</Option>
                  <Option value="Beklemede">Beklemede</Option>
                  <Option value="Arşivde">Arşivde</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fieldType" label="Saha Tipi">
                <Select placeholder="Saha tipine göre filtrele" allowClear className="rounded-lg">
                  <Option value="Yeraltı">Yeraltı</Option>
                  <Option value="Havai">Havai</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="city" label="Şehir">
                <Input placeholder="Şehre göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="clusterName" label="Küme Adı">
                <Input placeholder="Küme adına göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fieldName" label="Saha Adı">
                <Input placeholder="Saha adına göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="ddo" label="DDO">
                <Input placeholder="DDO'ya göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tellcordiaNo" label="Tellcordia No">
                <Input placeholder="Tellcordia numarasına göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="homePass" label="Home Pass">
                <Input placeholder="Home pass'e göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="contractor" label="Taşeron">
                <Input placeholder="Taşerona göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="supervisor" label="Supervisor">
                <Input placeholder="Supervisor'a göre ara" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateRange" label="Tarih Aralığı">
                <RangePicker style={{ width: '100%' }} className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={handleReset}
                  className="rounded-lg"
                >
                  Temizle
                </Button>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  htmlType="submit"
                  className="bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md"
                >
                  Ara
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;
