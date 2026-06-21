import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Input, Select, Card } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { getCollegeThesisList } from '../../api'
import { statusMap } from '../../utils/constants'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select

function SecretaryThesisList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize, statusFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getCollegeThesisList({
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

  const columns = [
    { title: '论文编号', dataIndex: 'thesisNo', width: 130 },
    { title: '论文题目', dataIndex: 'title', ellipsis: true },
    { title: '学生姓名', dataIndex: 'studentName', width: 100 },
    { title: '学科方向', dataIndex: 'subjectDirectionName', width: 120 },
    { title: '版本', dataIndex: 'version', width: 60, render: v => `v${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      width: 130,
      render: (status) => {
        const info = statusMap[status] || { text: status, type: 'default' }
        return <Tag color={info.type === 'success' ? 'green' : info.type === 'error' ? 'red' : info.type === 'warning' ? 'orange' : 'blue'}>{info.text}</Tag>
      },
    },
    { title: '当前阶段', dataIndex: 'currentStage', width: 140 },
    {
      title: '评审截止',
      dataIndex: 'reviewDeadline',
      width: 160,
      render: (t, record) => {
        if (!t) return '-'
        const isOverdue = dayjs().isAfter(dayjs(t))
        return (
          <Space>
            <span>{dayjs(t).format('YYYY-MM-DD')}</span>
            {isOverdue && record.status === 'REVIEWING' && <Tag color="red">已超期</Tag>}
          </Space>
        )
      },
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />}>
          详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">论文管理</h2>

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
            placeholder="状态筛选"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            allowClear
          >
            {Object.entries(statusMap).map(([key, val]) => (
              <Select.Option key={key} value={key}>{val.text}</Select.Option>
            ))}
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
    </div>
  )
}

export default SecretaryThesisList
