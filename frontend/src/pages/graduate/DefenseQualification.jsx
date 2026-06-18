import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Input, Select, Card, Modal, Form, Input as AntInput } from 'antd'
import { SearchOutlined, EditOutlined, TrophyOutlined, CloseOutlined } from '@ant-design/icons'
import { getDefenseQualificationList, updateQualification } from '../../api'
import dayjs from 'dayjs'

const { TextArea } = AntInput
const { Option } = Select

function GraduateDefenseQualification() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize, statusFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getDefenseQualificationList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        status: statusFilter,
        keyword,
      })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record) => {
    setCurrentRecord(record)
    form.setFieldsValue({
      eligible: record.eligible,
      reason: record.reason,
    })
    setEditModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await updateQualification(currentRecord.id, values.eligible, values.reason)
      setEditModalVisible(false)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const statusMap = {
    PASS: { text: '通过', color: 'green' },
    REVISION: { text: '需修改', color: 'orange' },
    FAIL: { text: '不通过', color: 'red' },
  }

  const columns = [
    { title: '学生姓名', dataIndex: 'studentName', width: 120 },
    { title: '论文ID', dataIndex: 'thesisId', width: 100 },
    {
      title: '是否通过',
      dataIndex: 'eligible',
      width: 100,
      render: (v) => v
        ? <Tag color="green" icon={<TrophyOutlined />}>获得资格</Tag>
        : <Tag color="red" icon={<CloseOutlined />}>未获得</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    { title: '原因', dataIndex: 'reason', ellipsis: true },
    { title: '答辩轮次', dataIndex: 'defenseRound', width: 100 },
    {
      title: '审核时间',
      dataIndex: 'reviewTime',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          调整
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">答辩资格管理</h2>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索学生姓名"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ width: 200 }}
            onPressEnter={loadData}
          />
          <Select
            placeholder="状态筛选"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value="PASS">通过</Select.Option>
            <Select.Option value="REVISION">需修改</Select.Option>
            <Select.Option value="FAIL">不通过</Select.Option>
          </Select>
          <Button type="primary" onClick={loadData}>查询</Button>
        </Space>
      </Card>

      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: (page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize })),
          }}
        />
      </Card>

      <Modal
        title="调整答辩资格"
        open={editModalVisible}
        onOk={handleSubmit}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="eligible"
            label="是否获得答辩资格"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select>
              <Select.Option value={true}>是 - 获得答辩资格</Select.Option>
              <Select.Option value={false}>否 - 不获得答辩资格</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="reason"
            label="原因说明"
            rules={[{ required: true, message: '请填写原因' }]}
          >
            <TextArea rows={4} placeholder="请说明调整原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default GraduateDefenseQualification
