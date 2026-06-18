import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Modal, Form, Input, message, Card, Drawer, Descriptions, List } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import { getPendingReviewList, collegeReview, getThesisVersions, getAvoidanceByThesis } from '../../api'
import dayjs from 'dayjs'

const { TextArea } = Input

function SecretaryReviewList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [reviewType, setReviewType] = useState('pass')
  const [form] = Form.useForm()
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailThesis, setDetailThesis] = useState(null)
  const [versions, setVersions] = useState([])
  const [avoidanceList, setAvoidanceList] = useState([])

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getPendingReviewList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePass = (record) => {
    setCurrentRecord(record)
    setReviewType('pass')
    form.resetFields()
    setModalVisible(true)
  }

  const handleReject = (record) => {
    setCurrentRecord(record)
    setReviewType('reject')
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await collegeReview({
        thesisId: currentRecord.id,
        passed: reviewType === 'pass',
        remark: values.remark,
      })
      message.success(reviewType === 'pass' ? '初审通过' : '初审已驳回')
      setModalVisible(false)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleViewDetail = async (record) => {
    setDetailThesis(record)
    setDetailVisible(true)
    try {
      const [vers, avoidance] = await Promise.all([
        getThesisVersions(record.id),
        getAvoidanceByThesis(record.id),
      ])
      setVersions(vers || [])
      setAvoidanceList(avoidance || [])
    } catch (e) {
      console.error(e)
    }
  }

  const statusMap = {
    SUBMITTED: { text: '待初审', color: 'blue' },
    COLLEGE_REVIEWING: { text: '初审中', color: 'orange' },
  }

  const columns = [
    { title: '论文编号', dataIndex: 'thesisNo', width: 130 },
    { title: '论文题目', dataIndex: 'title', ellipsis: true },
    { title: '学生姓名', dataIndex: 'studentName', width: 100 },
    { title: '学号', dataIndex: 'studentNo', width: 120 },
    { title: '学科方向', dataIndex: 'subjectDirectionName', width: 120 },
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
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handlePass(record)}>
            通过
          </Button>
          <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleReject(record)}>
            驳回
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">初审待办</h2>

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
        title={reviewType === 'pass' ? '初审通过' : '初审驳回'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="remark"
            label={reviewType === 'pass' ? '审核意见' : '驳回原因'}
            rules={[{ required: true, message: '请填写意见' }]}
          >
            <TextArea rows={4} placeholder={reviewType === 'pass' ? '请输入审核意见...' : '请输入驳回原因，例如格式问题、方向不符等'} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="论文详情"
        width={640}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {detailThesis && (
          <div>
            <Descriptions title="基本信息" bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="论文编号">{detailThesis.thesisNo}</Descriptions.Item>
              <Descriptions.Item label="论文题目">{detailThesis.title}</Descriptions.Item>
              <Descriptions.Item label="匿名题目">{detailThesis.anonymousTitle}</Descriptions.Item>
              <Descriptions.Item label="学生姓名">{detailThesis.studentName}</Descriptions.Item>
              <Descriptions.Item label="学号">{detailThesis.studentNo}</Descriptions.Item>
              <Descriptions.Item label="学科方向">{detailThesis.subjectDirectionName}</Descriptions.Item>
              <Descriptions.Item label="关键词">{detailThesis.keywords || '-'}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{detailThesis.submitTime ? dayjs(detailThesis.submitTime).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginTop: 16 }}>版本记录</h4>
            <List
              size="small"
              dataSource={versions}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={`v${item.version} - ${item.fileName}`}
                    description={item.isAnonymous ? '包含匿名版' : ''}
                  />
                  <Button type="link" size="small">下载</Button>
                </List.Item>
              )}
            />

            {avoidanceList.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>回避名单申请</h4>
                <List
                  size="small"
                  dataSource={avoidanceList}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        title={item.expertName + ' - ' + item.expertOrganization}
                        description={item.reason}
                      />
                      <Tag color={item.status === 'APPROVED' ? 'green' : item.status === 'REJECTED' ? 'red' : 'orange'}>
                        {item.status === 'APPROVED' ? '已通过' : item.status === 'REJECTED' ? '已拒绝' : '待审核'}
                      </Tag>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default SecretaryReviewList
