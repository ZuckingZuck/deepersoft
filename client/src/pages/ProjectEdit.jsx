import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Typography, 
  Space, 
  message,
  Spin,
  Row,
  Col,
  DatePicker,
  InputNumber
} from "antd";
import { 
  SaveOutlined, 
  ArrowLeftOutlined,
  ProjectOutlined
} from "@ant-design/icons";
import api from "../utils/api";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/projects/${id}`);
        setProject(response.data);
        form.setFieldsValue({
          ...response.data,
          date: response.data.date ? moment(response.data.date) : null
        });
      } catch (error) {
        message.error("Proje bilgileri yüklenirken bir hata oluştu");
        navigate("/projects");
      }
    };

    fetchProject();
  }, [id, form, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.put(`/api/projects/${id}`, {
        ...values,
        date: values.date ? values.date.format("YYYY-MM-DD") : null
      });
      message.success("Proje başarıyla güncellendi");
      navigate(`/projects/${id}`);
    } catch (error) {
      message.error("Proje güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Proje yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <Card className="shadow-lg rounded-2xl border-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/projects/${id}`)}
              className="mr-4"
            >
              Geri Dön
            </Button>
            <ProjectOutlined className="text-2xl mr-3 text-blue-600" />
            <Title level={2} className="m-0">Proje Düzenle</Title>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            name: project.name,
            ddo: project.ddo,
            tellcordiaNo: project.tellcordiaNo,
            homePass: project.homePass,
            city: project.city,
            clusterName: project.clusterName,
            fieldName: project.fieldName,
            fieldType: project.fieldType,
            status: project.status,
            date: project.date ? moment(project.date) : null,
            description: project.description
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Proje Adı"
                rules={[{ required: true, message: "Lütfen proje adını girin" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Durum"
                rules={[{ required: true, message: "Lütfen durumu seçin" }]}
              >
                <Select>
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
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ddo"
                label="DDO"
                rules={[{ required: true, message: "Lütfen DDO'yu girin" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="tellcordiaNo"
                label="Tellcordia No"
                rules={[{ required: true, message: "Lütfen Tellcordia numarasını girin" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="homePass"
                label="Home Pass"
                rules={[{ required: true, message: "Lütfen Home Pass'i girin" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="Şehir"
                rules={[{ required: true, message: "Lütfen şehri girin" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="clusterName"
                label="Küme Adı"
                rules={[{ required: true, message: "Lütfen küme adını girin" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fieldName"
                label="Saha Adı"
                rules={[{ required: true, message: "Lütfen saha adını girin" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fieldType"
                label="Saha Tipi"
                rules={[{ required: true, message: "Lütfen saha tipini seçin" }]}
              >
                <Select>
                  <Option value="Yeraltı">Yeraltı</Option>
                  <Option value="Havai">Havai</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Tarih"
                rules={[{ required: true, message: "Lütfen tarihi seçin" }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                htmlType="submit"
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Kaydet
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProjectEdit; 