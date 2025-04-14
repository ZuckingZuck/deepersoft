import React, { useState, useEffect } from "react";
import { Form, Input, Button, Alert, Typography, Spin, message } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined, SafetyOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../redux/userSlice";
import api from "../utils/api";

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoVisible, setLogoVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const timer1 = setTimeout(() => setLogoVisible(true), 300);
    const timer2 = setTimeout(() => setFormVisible(true), 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const onFinish = async (values) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/auth/login", values);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        await dispatch(userLogin(response.data.user));

        message.success("Giriş başarılı! Yönlendiriliyorsunuz...");
        navigate("/", { replace: true });
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Giriş yapılırken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Animasyonlu Blob Arka Plan */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300 opacity-30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-300 opacity-30 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div
          className={`flex justify-center mb-8 transform ${
            logoVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          } transition-all duration-700 ease-out`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full blur-lg opacity-50"></div>
            <div className="relative bg-white p-6 rounded-full shadow-xl">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-sky-600 rounded-full">
                <SafetyOutlined className="text-white text-4xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Giriş Formu */}
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transform ${
            formVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          } transition-all duration-700 ease-out`}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-sky-600 p-8 text-white">
            <Title level={3} className="text-white m-0 flex items-center">
              <LoginOutlined className="mr-3 text-2xl" /> Giriş Yap
            </Title>
            <p className="m-0 mt-2 text-blue-100 text-base">
              RMODEL Yönetim Paneline Hoş Geldiniz
            </p>
          </div>

          <div className="p-8">
            {error && (
              <Alert
                message="Giriş Hatası"
                description={error}
                type="error"
                showIcon
                className="mb-6"
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="login-form"
            >
              <Form.Item
                name="userName"
                rules={[{ required: true, message: "Lütfen kullanıcı adınızı girin!" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Kullanıcı Adı"
                  className="py-3 rounded-lg border-gray-300 hover:border-indigo-500 focus:border-indigo-500 transition-colors"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Lütfen şifrenizi girin!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Şifre"
                  className="py-3 rounded-lg border-gray-300 hover:border-indigo-500 focus:border-indigo-500 transition-colors"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item className="mb-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-sky-600 border-none shadow-md hover:shadow-lg rounded-lg flex items-center justify-center text-lg font-medium transition-all duration-300 hover:scale-[1.02]"
                  loading={loading}
                >
                  {loading ? (
                    <Spin />
                  ) : (
                    <>
                      <LoginOutlined className="mr-2" /> Giriş Yap
                    </>
                  )}
                </Button>
              </Form.Item>
            </Form>

            <div className="text-gray-400 text-sm text-center mt-8 border-t border-gray-100 pt-6">
              <p className="font-medium">© 2025 RMODEL</p>
              <p>Tüm Hakları Saklıdır</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
