import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Modal, Form, Input, message, Card } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import { getSupervisorConfirmations, confirmRevision, getThesisVersions } from '../../api'
import dayjs from 'dayjs'

const { TextArea } = Input

function SupervisorConfirmList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [confirmType, setConfirmType] = useState('approve')
  const [form] = Form.useForm()
  const [versions, setVersions] = useState([])

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize, statusFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getSupervisorConfirmations({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        status: statusFilter,
      })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (record) => {
    setCurrentRecord(record)
    setConfirmType('approve')
    form.resetFields()
    setModalVisible(true)
  }

  const handleReject = (record) => {
    setCurrentRecord(record)
    setConfirmType('reject')
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await confirmRevision({
        confirmationId: currentRecord.id,
        passed: confirmType === 'approve',
        supervisorOpinion: values.supervisorOpinion,
      })
      message.success(confirmType === 'approve' ? '已确认通过' : '已驳回')
      setModalVisible(false)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const viewVersions = async (thesisId) => {
    try {
      const result = await getThesisVersions(thesisId)
      setVersions(result || [])
    } catch (e) {
      console.error(e)
    }
  }

  const statusMap = {
    PENDING: { text: '待确认', color: 'orange' },
    APPROVED: { text: '已通过', color: 'green' },
    REJECTED: { text: '已驳回', color: 'red' },
  }

  const columns = [
    { title: '学生姓名', dataIndex: 'studentName', width: 120 },
    {
      title: '修改说明',
      dataIndex: 'revisionDescription',
      ellipsis: true,
    },
    {
      title: '导师意见',
      dataIndex: 'supervisorOpinion',
      ellipsis: true,
      render: (t) => t || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '确认时间',
      dataIndex: 'confirmTime',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 180,
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' && (
            <>
              <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
                通过
              </Button>
              <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleReject(record)}>
                驳回
              </Button>
            </>
          )}
          <Button size="small" icon={<EyeOutlined />} onClick={() => viewVersions(record.thesisId)}>
            查看版本
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">修改确认</h2>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <span>状态筛选：</span>
          {['全部', '待确认', '已通过', '已驳回'].map((item, idx) => (
            <Button
              key={item}
              type={(!statusFilter && idx === 0) || (statusFilter === ['', 'PENDING', 'APPROVED', 'REJECTED'][idx]) ? 'primary' : 'default'}
              onClick={() => setStatusFilter(['', 'PENDING', 'APPROVED', 'REJECTED'][idx])}
            >
              {item}
            </Button>
          ))}
        </Space>

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
        title={confirmType === 'approve' ? '确认修改通过' : '驳回修改'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="supervisorOpinion"
            label={confirmType === 'approve' ? '导师意见' : '驳回原因'}
            rules={[{ required: true, message: '请填写意见' }]}
          >
            <TextArea rows={6} placeholder={confirmType === 'approve' ? '请输入导师确认意见...' : '请输入驳回原因...'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SupervisorConfirmList
