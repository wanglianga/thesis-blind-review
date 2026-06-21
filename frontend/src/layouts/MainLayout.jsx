import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
  ScheduleOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  BookOutlined,
  CheckCircleOutlined,
  RetweetOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'

const { Header, Sider, Content } = Layout

const menuConfig = {
  STUDENT: [
    { key: '/student', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/student/thesis', icon: <FileTextOutlined />, label: '我的论文' },
    { key: '/student/thesis/submit', icon: <BookOutlined />, label: '提交论文' },
  ],
  SUPERVISOR: [
    { key: '/supervisor', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/supervisor/confirmations', icon: <CheckCircleOutlined />, label: '修改确认' },
  ],
  COLLEGE_SECRETARY: [
    { key: '/secretary', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/secretary/pending-review', icon: <AuditOutlined />, label: '初审待办' },
    { key: '/secretary/thesis', icon: <FileTextOutlined />, label: '论文管理' },
  ],
  GRADUATE_SCHOOL: [
    { key: '/graduate', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/graduate/expert-match', icon: <TeamOutlined />, label: '专家匹配' },
    { key: '/graduate/review-progress', icon: <ScheduleOutlined />, label: '评审进度' },
    { key: '/graduate/major-revision-review', icon: <RetweetOutlined />, label: '复审审核' },
    { key: '/graduate/defense-qualification', icon: <TrophyOutlined />, label: '答辩资格' },
    { key: '/graduate/system', icon: <SettingOutlined />, label: '系统管理' },
  ],
  EXTERNAL_REVIEWER: [
    { key: '/expert', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/expert/invitations', icon: <AuditOutlined />, label: '评审任务' },
  ],
}

const roleTitleMap = {
  STUDENT: '学生端',
  SUPERVISOR: '导师端',
  COLLEGE_SECRETARY: '学院秘书端',
  GRADUATE_SCHOOL: '研究生院端',
  EXTERNAL_REVIEWER: '外审专家端',
}

function MainLayout({ children, role }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userInfo, setUserInfo] = useState(null)
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    const userStr = localStorage.getItem('userInfo')
    if (userStr) {
      setUserInfo(JSON.parse(userStr))
    }
  }, [])

  useEffect(() => {
    const path = location.pathname
    const menus = menuConfig[role] || []
    const matchKey = menus.find(m => path.startsWith(m.key) && m.key !== '/' + role.toLowerCase())?.key
    setSelectedKeys([matchKey || '/' + role.toLowerCase()])
  }, [location.pathname, role])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="layout-container">
      <Sider width={220} theme="dark">
        <div className="logo">盲审管理平台</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={({ key }) => navigate(key)}
          items={menuConfig[role] || []}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>{roleTitleMap[role]}</div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{userInfo?.realName || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="content-wrapper">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
