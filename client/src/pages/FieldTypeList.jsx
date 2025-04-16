import React from 'react'
import { useSelector } from 'react-redux'
import { Table, Card } from 'antd';
const FieldTypeList = () => {
    const fieldTypeList = useSelector((state) => state.system.fieldTypeList);
    console.log(fieldTypeList);
    const columns = [
        {
            title: "İsim",
            dataIndex: "name",
            key: "name"
        },
        {
            title: "Kod",
            dataIndex: "code",
            key: "code"
        }
    ]
  return (
    <div className='p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen'>
        <h1 className='text-center font-bold mb-5'>SAHA TİPLERİ</h1>
        <Card className="shadow-lg rounded-2xl border-0">
            <Table columns={columns} dataSource={fieldTypeList} />
        </Card>
    </div>
  )
}

export default FieldTypeList