import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Input, Select, Card, Modal, Form, Input as AntInput, Drawer, Descriptions, List, Avatar, Tabs, message, Row, Col } from 'antd'
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'
import { getGraduateReviewingList, graduateReviewDecision, getThesisComments, getThesisVersions, getThesisConfirmations, getThesisCommentsByRound } from '../../api'
import { statusMap, reviewResultMap } from '../../utils/constants'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = AntInput

function GraduateMajorRevisionReview() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [collegeFilter, setCollegeFilter] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentThesis, setCurrentThesis] = useState(null)
  const [decisionModalVisible, setDecisionModalVisible] = useState(false)
  const [decisionType, setDecisionType] = useState(null)
  const [decisionReason, setDecisionReason] = useState('')
  const [firstRoundComments, setFirstRoundComments] = useState([])
  const [secondRoundComments, setSecondRoundComments] = useState([])
  const [versions, setVersions] = useState([])
  const [confirmations, setConfirmations] = useState([])
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getGraduateReviewingList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        college: collegeFilter,
      })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const viewDetail = async (record) => {
    setCurrentThesis(record)
    setDetailVisible(true)
    try {
      const [comments1, comments2, vers, confs] = await Promise.all([
        getThesisCommentsByRound(record.id, 1).catch(() => []),
        getThesisCommentsByRound(record.id, 2).catch(() => []),
        getThesisVersions(record.id).catch(() => []),
        getThesisConfirmations(record.id).catch(() => []),
      ])
      setFirstRoundComments(comments1 || [])
      setSecondRoundComments(comments2 || [])
      setVersions(vers || [])
      setConfirmations(confs || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleDecision = (record, type) => {
    setCurrentThesis(record)
    setDecisionType(type)
    setDecisionReason('')
    setDecisionModalVisible(true)
  }

  const handleSubmitDecision = async () => {
    if (!decisionReason || decisionReason.trim() === '') {
      message.warning('请填写审核原因')
      return
    }
    try {
      await graduateReviewDecision(currentThesis.id, decisionType === 'pass', decisionReason)
      message.success(decisionType === 'pass' ? '已放行答辩' : '已驳回答辩资格')
      setDecisionModalVisible(false)
      setDetailVisible(false)
      loadData()
    } catch (e) {
      console.error(e)
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '论文编号', dataIndex: 'thesisNo', width: 130 },
    { title: '论文题目', dataIndex: 'title', ellipsis: true },
    { title: '学生姓名', dataIndex: 'studentName', width: 100 },
    { title: '学院', dataIndex: 'college', width: 120 },
    { title: '学科方向', dataIndex: 'subjectDirectionName', width: 130 },
    {
      title: '版本',
      dataIndex: 'version',
      width: 80,
      render: v => `v${v}`,
    },
    {
      title: '评阅完成时间',
      dataIndex: 'reviewCompleteTime',
      width: 170,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
            对比审核
          </Button>
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleDecision(record, 'pass')}>
            放行答辩
          </Button>
          <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleDecision(record, 'reject')}>
            不予放行
          </Button>
        </Space>
      ),
    },
  ]

  const renderCommentCard = (comment, idx, round) => (
    <Card
      key={comment.id}
      className="comment-card"
      title={
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>第{round}轮 - 外审专家 {idx + 1}</span>
          <Tag color={reviewResultMap[comment.result]?.type === 'success' ? 'green' : reviewResultMap[comment.result]?.type === 'error' ? 'red' : 'blue'}>
            {reviewResultMap[comment.result]?.text}
          </Tag>
          {comment.score != null && <span style={{ color: '#faad14' }}>得分：{comment.score}分</span>}
        </Space>
      }
      size="small"
      style={{ marginBottom: 12 }}
    >
      <div style={{ marginBottom: 12 }}>
        <strong>总体评价：</strong>{comment.overallEvaluation || '-'}
      </div>
      {comment.innovationComment && (
        <div style={{ marginBottom: 8 }}><strong>创新性评价：</strong>{comment.innovationComment}</div>
      )}
      {comment.academicValueComment && (
        <div style={{ marginBottom: 8 }}><strong>学术价值评价：</strong>{comment.academicValueComment}</div>
      )}
      {comment.methodologyComment && (
        <div style={{ marginBottom: 8 }}><strong>研究方法评价：</strong>{comment.methodologyComment}</div>
      )}
      {comment.writingComment && (
        <div style={{ marginBottom: 8 }}><strong>写作质量评价：</strong>{comment.writingComment}</div>
      )}
      {comment.revisionSuggestions && (
        <div style={{ marginTop: 12, padding: '12px', background: '#fff7e6', borderRadius: 4 }}>
          <strong style={{ color: '#fa8c16' }}>修改建议：</strong>
          <div style={{ marginTop: 4 }}>{comment.revisionSuggestions}</div>
        </div>
      )}
      {comment.majorIssues && (
        <div style={{ marginTop: 12, padding: '12px', background: '#fff1f0', borderRadius: 4 }}>
          <strong style={{ color: '#ff4d4f' }}>主要问题：</strong>
          <div style={{ marginTop: 4 }}>{comment.majorIssues}</div>
        </div>
      )}
      {comment.minorIssues && (
        <div style={{ marginTop: 12, padding: '12px', background: '#f6ffed', borderRadius: 4 }}>
          <strong style={{ color: '#52c41a' }}>次要问题：</strong>
          <div style={{ marginTop: 4 }}>{comment.minorIssues}</div>
        </div>
      )}
      <div style={{ marginTop: 12, textAlign: 'right', color: '#999', fontSize: 12 }}>
        提交时间：{comment.submitTime ? dayjs(comment.submitTime).format('YYYY-MM-DD HH:mm') : '-'}
      </div>
    </Card>
  )

  const tabItems = [
    {
      key: 'compare',
      label: '意见对比',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Card title="第一轮评阅意见（旧版）" type="inner" size="small">
              {firstRoundComments.length > 0 ? (
                firstRoundComments.map((c, i) => renderCommentCard(c, i, 1))
              ) : (
                <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无第一轮评阅意见</div>
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="复审评阅意见（新版）" type="inner" size="small">
              {secondRoundComments.length > 0 ? (
                secondRoundComments.map((c, i) => renderCommentCard(c, i, 2))
              ) : (
                <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无复审评阅意见</div>
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'response',
      label: '学生修改回应',
      children: (
        <div>
          <Card title="修改版本记录" type="inner" size="small" style={{ marginBottom: 16 }}>
            <List
              size="small"
              dataSource={versions}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={
                      <Space>
                        <span>v{item.version}</span>
                        {item.isAnonymous && <Tag>匿名版</Tag>}
                      </Space>
                    }
                    description={
                      <div>
                        <div>文件：{item.fileName}</div>
                        {item.revisionDescription && (
                          <div style={{ marginTop: 4 }}>修改说明：{item.revisionDescription}</div>
                        )}
                        {item.differenceDescription && (
                          <div style={{ marginTop: 4, color: '#1890ff' }}>差异说明：{item.differenceDescription}</div>
                        )}
                        <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                          上传时间：{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm') : '-'}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="导师确认记录" type="inner" size="small">
            <List
              size="small"
              dataSource={confirmations}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <span>{item.studentName} - 修改确认</span>
                        <Tag color={item.status === 'APPROVED' ? 'green' : item.status === 'REJECTED' ? 'red' : 'orange'}>
                          {item.status === 'APPROVED' ? '已通过' : item.status === 'REJECTED' ? '已驳回' : '待确认'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        {item.revisionDescription && (
                          <div>修改说明：{item.revisionDescription}</div>
                        )}
                        {item.supervisorOpinion && (
                          <div style={{ marginTop: 4, color: '#52c41a' }}>导师意见：{item.supervisorOpinion}</div>
                        )}
                        <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                          提交时间：{item.submitTime ? dayjs(item.submitTime).format('YYYY-MM-DD HH:mm') : '-'}
                          {item.confirmTime && ` | 确认时间：${dayjs(item.confirmTime).format('YYYY-MM-DD HH:mm')}`}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'info',
      label: '论文信息',
      children: currentThesis ? (
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="论文编号">{currentThesis.thesisNo}</Descriptions.Item>
          <Descriptions.Item label="当前版本">v{currentThesis.version}</Descriptions.Item>
          <Descriptions.Item label="论文题目" span={2}>{currentThesis.title}</Descriptions.Item>
          <Descriptions.Item label="学生姓名">{currentThesis.studentName}</Descriptions.Item>
          <Descriptions.Item label="学号">{currentThesis.studentNo}</Descriptions.Item>
          <Descriptions.Item label="学科方向">{currentThesis.subjectDirectionName}</Descriptions.Item>
          <Descriptions.Item label="所属学院">{currentThesis.college}</Descriptions.Item>
          <Descriptions.Item label="专业">{currentThesis.major}</Descriptions.Item>
          <Descriptions.Item label="答辩轮次">第{currentThesis.defenseRound}轮</Descriptions.Item>
          <Descriptions.Item label="当前状态">
            <Tag color={statusMap[currentThesis.status]?.type === 'success' ? 'green' : statusMap[currentThesis.status]?.type === 'error' ? 'red' : 'blue'}>
              {statusMap[currentThesis.status]?.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="当前阶段">{currentThesis.currentStage}</Descriptions.Item>
          <Descriptions.Item label="首次评阅完成">
            {currentThesis.firstReviewCompleteTime ? dayjs(currentThesis.firstReviewCompleteTime).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="复审完成时间">
            {currentThesis.reviewCompleteTime ? dayjs(currentThesis.reviewCompleteTime).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : null,
    },
  ]

  return (
    <div>
      <h2 className="page-header">重大修改复审审核</h2>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索论文标题/学生姓名"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ width: 250 }}
            onPressEnter={loadData}
          />
          <Select
            placeholder="学院筛选"
            value={collegeFilter || undefined}
            onChange={setCollegeFilter}
            style={{ width: 160 }}
            allowClear
          >
            <Option value="计算机学院">计算机学院</Option>
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

      <Drawer
        title="复审对比审核"
        width={1100}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentThesis && (
          <div>
            <Card type="inner" size="small" style={{ marginBottom: 16 }}>
              <Space style={{ marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{currentThesis.title}</h3>
                <Tag color="orange">重大修改复审</Tag>
              </Space>
              <div style={{ color: '#666', marginBottom: 12 }}>
                学生：{currentThesis.studentName} | 学院：{currentThesis.college} | 学科方向：{currentThesis.subjectDirectionName}
              </div>
              <Space>
                <Button type="primary" icon={<CheckOutlined />} onClick={() => handleDecision(currentThesis, 'pass')}>
                  放行答辩
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={() => handleDecision(currentThesis, 'reject')}>
                  不予放行
                </Button>
              </Space>
            </Card>

            <Tabs items={tabItems} />
          </div>
        )}
      </Drawer>

      <Modal
        title={decisionType === 'pass' ? '放行答辩确认' : '不予放行确认'}
        width={520}
        open={decisionModalVisible}
        onOk={handleSubmitDecision}
        onCancel={() => setDecisionModalVisible(false)}
        okText={decisionType === 'pass' ? '确认放行' : '确认驳回'}
        cancelText="取消"
        okButtonProps={{ danger: decisionType !== 'pass' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label={decisionType === 'pass' ? '放行原因' : '不予放行原因'}
            rules={[{ required: true, message: '请填写原因' }]}
          >
            <TextArea
              rows={4}
              value={decisionReason}
              onChange={e => setDecisionReason(e.target.value)}
              placeholder={decisionType === 'pass'
                ? '请说明放行答辩的依据，例如：学生已针对所有重大问题进行了修改，复审专家评价良好...'
                : '请说明不予放行的原因，例如：修改不充分，仍存在重大缺陷...'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default GraduateMajorRevisionReview
