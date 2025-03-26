import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Table, Tooltip } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const calculateElapsedTime = (createdAt) => {
  const startDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - startDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Gün olarak hesapla

  if (diffInDays === 0) return "Bugün";
  if (diffInDays === 1) return "Dün";
  return `${diffInDays} gün`;
};

const Projects = () => {
  const [searchParams] = useSearchParams();
  const s = searchParams.get("s"); // URL'den "s" parametresini al
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const FetchProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API}/api/project?projectStatus=${s}`
        );

        const updatedProjects = response.data.map((project) => ({
          ...project,
          elapsedTime: calculateElapsedTime(project.createdAt),
        }));

        setProjects(updatedProjects);
      } catch (error) {
        console.log(error);
      }
    };
    FetchProjects();
  }, [s]);

  const columns = [
    { title: "Durum", dataIndex: "status", key: "status", width: 90 },
    { title: "DDO", dataIndex: "ddo", key: "ddo", width: 100 },
    { title: "Tellcordia No", dataIndex: "tellcordiaNo", key: "tellcordiaNo", width: 120 },
    { title: "Saha Adı", dataIndex: "fieldName", key: "fieldName", width: 150 },
    {
      title: "Başlangıç",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (createdAt) => new Date(createdAt).toLocaleDateString("tr-TR"),
    },
    {
      title: "Geçen Süre",
      dataIndex: "elapsedTime",
      key: "elapsedTime",
      width: 100,
      render: (text) => <span>{text}</span>,
    },
    { title: "Şehir", dataIndex: "city", key: "city", width: 100 },
    { title: "Öbek Adı", dataIndex: "clusterName", key: "clusterName", width: 100 },
    { title: "Proje", dataIndex: "name", key: "name", width: 120 },
    { title: "Saha Tipi", dataIndex: "fieldType", key: "fieldType", width: 100 },

    ...["IMLT", "AKTV", "ISLH", "HSRSZ", "KMZ", "OTDR", "MTBKT", "KSF", "BRKD"].map((field) => ({
      title: field,
      dataIndex: field,
      key: field,
      align: "center",
      width: 60,
      render: (value) => (
        <Tooltip title={value ? "Evet" : "Hayır"}>
          {value ? <CheckCircleOutlined style={{ color: "green" }} /> : <CloseCircleOutlined style={{ color: "red" }} />}
        </Tooltip>
      ),
    })),
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Projeler - {s}</h2>
      <Table
        columns={columns}
        dataSource={projects}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 5, position: ["bottomCenter"] }}
        size="small" // Daha kompakt tablo
        scroll={{ x: "max-content" }} // Mobil uyumluluk için yatay kaydırma
      />
    </div>
  );
};

export default Projects;
