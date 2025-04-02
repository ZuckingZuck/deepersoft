import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSystemData } from "../redux/systemSlice";
import { fetchAllUsers } from "../redux/userSlice";
import { fetchAllClusters } from "../redux/clusterSlice";
import { 
  Table, 
  Button, 
  Card, 
  Space, 
  Tag, 
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Avatar,
  message,
  Spin
} from "antd";
import { 
  SearchOutlined, 
  ClearOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ProjectOutlined
} from "@ant-design/icons";
import api from "../utils/api";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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

const calculateElapsedTime = (createdAt) => {
  const startDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - startDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Bugün";
  if (diffInDays === 1) return "Dün";
  return `${diffInDays} gün`;
};

const SearchResults = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Redux state'lerini çek
  const { fieldTypeList } = useSelector((state) => state.system);
  const { contractors, supervisors } = useSelector((state) => state.user);
  const { cities, allClusters } = useSelector((state) => state.cluster);

  // Component mount olduğunda gerekli verileri yükle
  useEffect(() => {
    dispatch(fetchSystemData());
    dispatch(fetchAllUsers());
    dispatch(fetchAllClusters());
  }, [dispatch]);

  const handleSearch = async (values) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(values).forEach(key => {
        if (values[key]) {
          if (key === 'dateRange' && values[key]) {
            params.append('startDate', values[key][0].format('YYYY-MM-DD'));
            params.append('endDate', values[key][1].format('YYYY-MM-DD'));
          } else {
            params.append(key, values[key]);
          }
        }
      });

      const response = await api.get(`/api/project/search?${params.toString()}`);
      setResults(response.data);
    } catch (error) {
      message.error('Arama sırasında bir hata oluştu');
      console.error('Arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setResults([]);
  };

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
              <div>{record.supervisor?.fullName || "Atanmamış"}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Avatar size="small" icon={<TeamOutlined />} className="bg-green-500 mr-2" />
            <div>
              <div className="text-xs font-semibold">Taşeron</div>
              <div>{record.contractor?.fullName || "Atanmamış"}</div>
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

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <Card className="shadow-lg rounded-2xl border-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl mr-4">
              <ProjectOutlined className="text-2xl text-blue-600" />
            </div>
            <Title level={2} className="m-0 text-gray-800">Proje Arama</Title>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projects')}
            className="rounded-lg"
          >
            Projelere Dön
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          className="mb-6"
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
                  {fieldTypeList.map(type => (
                    <Option key={type._id} value={type.name}>{type.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="city" label="Şehir">
                <Select placeholder="Şehre göre ara" allowClear className="rounded-lg">
                  {cities.map(city => (
                    <Option key={city} value={city}>{city}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="clusterName" label="Küme Adı">
                <Select placeholder="Küme adına göre ara" allowClear className="rounded-lg">
                  {allClusters.map(cluster => (
                    <Option key={cluster._id} value={cluster.name}>{cluster.name}</Option>
                  ))}
                </Select>
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
                <Select placeholder="Taşerona göre ara" allowClear className="rounded-lg">
                  {contractors.map(contractor => (
                    <Option key={contractor._id} value={contractor._id}>
                      {contractor.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="supervisor" label="Supervisor">
                <Select placeholder="Supervisor'a göre ara" allowClear className="rounded-lg">
                  {supervisors.map(supervisor => (
                    <Option key={supervisor._id} value={supervisor._id}>
                      {supervisor.fullName}
                    </Option>
                  ))}
                </Select>
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
                  loading={loading}
                  className="bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md"
                >
                  Ara
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        {results.length > 0 && (
          <Table
            columns={columns}
            dataSource={results}
            rowKey="_id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} sonuç`
            }}
            scroll={{ x: 1100 }}
            className="rounded-lg overflow-hidden"
          />
        )}
      </Card>
    </div>
  );
};

export default SearchResults; 