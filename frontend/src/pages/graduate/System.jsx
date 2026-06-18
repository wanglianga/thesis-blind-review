import { useState } from 'react'
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, Select, message, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getUsers, createUser, getAllBatches, createBatch, getAllDirections, createDirection, getExperts, getSupervisors } from '../../api'
import { useEffect } from 'react'
import dayjs from 'dayjs'

const { Option } = Select

function GraduateSystem() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [userLoading, setUserLoading] = useState(false)
  const [batches, setBatches] = useState([])
  const [directions, setDirections] = useState([])
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [batchModalVisible, setBatchModalVisible] = useState(false)
  const [directionModalVisible, setDirectionModalVisible] = useState(false)
  const [userForm] = Form.useForm()
  const [batchForm] = Form.useForm()
  const [directionForm] = Form.useForm()
  const [roleFilter, setRoleFilter] = useState('')
  const [userPagination, setUserPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
    if (activeTab === 'batches') loadBatches()
    if (activeTab === 'directions') loadDirections()
  }, [activeTab, roleFilter, userPagination.current, userPagination.pageSize])

  const loadUsers = async () => {
    setUserLoading(true)
    try {
      const result = await getUsers({
        role: roleFilter,
        pageNum: userPagination.current,
        pageSize: userPagination.pageSize,
      })
      setUsers(result.list || [])
      setUserPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (e) {
      console.error(e)
    } finally {
      setUserLoading(false)
    }
  }

  const loadBatches = async () => {
    try {
      const result = await getAllBatches()
      setBatches(result || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadDirections = async () => {
    try {
      const result = await getAllDirections()
      setDirections(result || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateUser = async () => {
    try {
      const values = await userForm.validateFields()
      await createUser(values)
      message.success('用户创建成功')
      setUserModalVisible(false)
      userForm.resetFields()
      loadUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateBatch = async () => {
    try {
      const values = await batchForm.validateFields()
      await createBatch({
        ...values,
        startDate: values.startDate ? dayjs(values.startDate).toDate() : null,
        endDate: values.endDate ? dayjs(values.endDate).toDate() : null,
        reviewDeadline: values.reviewDeadline ? dayjs(values.reviewDeadline).toDate() : null,
      })
      message.success('批次创建成功')
      setBatchModalVisible(false)
      batchForm.resetFields()
      loadBatches()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateDirection = async () => {
    try {
      const values = await directionForm.validateFields()
      await createDirection(values)
      message.success('方向创建成功')
      setDirectionModalVisible(false)
      directionForm.resetFields()
      loadDirections()
    } catch (e) {
      console.error(e)
    }
  }

  const roleMap = {
    STUDENT: '学生',
    SUPERVISOR: '导师',
    COLLEGE_SECRETARY: '学院秘书',
    GRADUATE_SCHOOL: '研究生院',
    EXTERNAL_REVIEWER: '外审专家',
  }

  const userColumns = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '真实姓名', dataIndex: 'realName', width: 120 },
    { title: '角色', dataIndex: 'role', width: 120, render: r => roleMap[r] || r },
    { title: '学院', dataIndex: 'college', width: 150 },
    { title: '邮箱', dataIndex: 'email', width: 180 },
    { title: '职称/职务', dataIndex: 'title', width: 100 },
    { title: '所属单位', dataIndex: 'organization', width: 180 },
    { title: '研究方向', dataIndex: 'researchDirection', ellipsis: true },
  ]

  const batchColumns = [
    { title: '批次编号', dataIndex: 'batchNo', width: 140 },
    { title: '批次名称', dataIndex: 'batchName' },
    { title: '学期', dataIndex: 'semester', width: 120 },
    { title: '学院', dataIndex: 'college', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: s => <Tag color={s === 'ACTIVE' ? 'green' : s === 'PLANNED' ? 'blue' : 'default'}>
        {s === 'ACTIVE' ? '进行中' : s === 'PLANNED' ? '计划中' : s}
      </Tag>,
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      width: 160,
      render: t => t ? dayjs(t).format('YYYY-MM-DD') : '-',
    },
    {
      title: '评审截止',
      dataIndex: 'reviewDeadline',
      width: 160,
      render: t => t ? dayjs(t).format('YYYY-MM-DD') : '-',
    },
  ]

  const directionColumns = [
    { title: '方向代码', dataIndex: 'code', width: 120 },
    { title: '方向名称', dataIndex: 'name', width: 180 },
    { title: '所属学院', dataIndex: 'college', width: 150 },
    { title: '描述', dataIndex: 'description' },
  ]

  const tabItems = [
    {
      key: 'users',
      label: '用户管理',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Select
              placeholder="角色筛选"
              value={roleFilter || undefined}
              onChange={setRoleFilter}
              style={{ width: 160 }}
              allowClear
            >
              {Object.entries(roleMap).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setUserModalVisible(true)}>
              新增用户
            </Button>
          </Space>
          <Table
            loading={userLoading}
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            pagination={{
              current: userPagination.current,
              pageSize: userPagination.pageSize,
              total: userPagination.total,
              showSizeChanger: true,
              onChange: (page, pageSize) => setUserPagination(p => ({ ...p, current: page, pageSize })),
            }}
          />
        </div>
      ),
    },
    {
      key: 'batches',
      label: '送审批次管理',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setBatchModalVisible(true)}>
              新增批次
            </Button>
          </Space>
          <Table columns={batchColumns} dataSource={batches} rowKey="id" />
        </div>
      ),
    },
    {
      key: 'directions',
      label: '学科方向管理',
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setDirectionModalVisible(true)}>
              新增方向
            </Button>
          </Space>
          <Table columns={directionColumns} dataSource={directions} rowKey="id" />
        </div>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">系统管理</h2>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      <Modal
        title="新增用户"
        open={userModalVisible}
        onOk={handleCreateUser}
        onCancel={() => setUserModalVisible(false)}
        okText="创建"
        cancelText="取消"
        width={500}
      >
        <Form form={userForm} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password placeholder="默认123456" />
          </Form.Item>
          <Form.Item name="realName" label="真实姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select placeholder="请选择角色">
              {Object.entries(roleMap).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="college" label="学院">
            <Input placeholder="请输入学院" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="title" label="职称/职务">
            <Input placeholder="教授/副教授等" />
          </Form.Item>
          <Form.Item name="organization" label="所属单位">
            <Input placeholder="外审专家的所属单位" />
          </Form.Item>
          <Form.Item name="researchDirection" label="研究方向">
            <Input placeholder="请输入研究方向" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增送审批次"
        open={batchModalVisible}
        onOk={handleCreateBatch}
        onCancel={() => setBatchModalVisible(false)}
        okText="创建"
        cancelText="取消"
        width={500}
      >
        <Form form={batchForm} layout="vertical">
          <Form.Item name="batchNo" label="批次编号" rules={[{ required: true }]}>
            <Input placeholder="例如 BATCH202401" />
          </Form.Item>
          <Form.Item name="batchName" label="批次名称" rules={[{ required: true }]}>
            <Input placeholder="例如 2024年春季学期盲审第一批" />
          </Form.Item>
          <Form.Item name="semester" label="学期">
            <Input placeholder="例如 2024春季" />
          </Form.Item>
          <Form.Item name="college" label="学院">
            <Input placeholder="请输入学院" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="批次描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增学科方向"
        open={directionModalVisible}
        onOk={handleCreateDirection}
        onCancel={() => setDirectionModalVisible(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={directionForm} layout="vertical">
          <Form.Item name="code" label="方向代码" rules={[{ required: true }]}>
            <Input placeholder="例如 CS01" />
          </Form.Item>
          <Form.Item name="name" label="方向名称" rules={[{ required: true }]}>
            <Input placeholder="例如 人工智能" />
          </Form.Item>
          <Form.Item name="college" label="所属学院">
            <Input placeholder="请输入学院" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="方向描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default GraduateSystem
