import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout'
import StudentDashboard from './pages/student/Dashboard'
import StudentThesisList from './pages/student/ThesisList'
import StudentThesisSubmit from './pages/student/ThesisSubmit'
import StudentThesisDetail from './pages/student/ThesisDetail'
import StudentRevision from './pages/student/Revision'

import SupervisorDashboard from './pages/supervisor/Dashboard'
import SupervisorConfirmList from './pages/supervisor/ConfirmList'

import SecretaryDashboard from './pages/secretary/Dashboard'
import SecretaryReviewList from './pages/secretary/ReviewList'
import SecretaryThesisList from './pages/secretary/ThesisList'

import GraduateDashboard from './pages/graduate/Dashboard'
import GraduateExpertMatch from './pages/graduate/ExpertMatch'
import GraduateReviewProgress from './pages/graduate/ReviewProgress'
import GraduateDefenseQualification from './pages/graduate/DefenseQualification'
import GraduateSystem from './pages/graduate/System'

import ExpertDashboard from './pages/expert/Dashboard'
import ExpertInvitationList from './pages/expert/InvitationList'
import ExpertReview from './pages/expert/Review'

function App() {
  const [userInfo, setUserInfo] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('userInfo')
    if (token && userStr) {
      try {
        setUserInfo(JSON.parse(userStr))
      } catch (e) {
        console.error(e)
      }
    }
  }, [location.pathname])

  const isLoggedIn = () => {
    return !!localStorage.getItem('token')
  }

  const getDefaultRoute = () => {
    const userStr = localStorage.getItem('userInfo')
    if (!userStr) return '/login'
    try {
      const user = JSON.parse(userStr)
      switch (user.role) {
        case 'STUDENT': return '/student'
        case 'SUPERVISOR': return '/supervisor'
        case 'COLLEGE_SECRETARY': return '/secretary'
        case 'GRADUATE_SCHOOL': return '/graduate'
        case 'EXTERNAL_REVIEWER': return '/expert'
        default: return '/login'
      }
    } catch (e) {
      return '/login'
    }
  }

  return (
    <Routes>
      <Route path="/login" element={
        isLoggedIn() ? <Navigate to={getDefaultRoute()} replace /> : <Login />
      } />

      <Route path="/student/*" element={
        !isLoggedIn() ? <Navigate to="/login" replace /> :
        <MainLayout role="STUDENT">
          <Routes>
            <Route index element={<StudentDashboard />} />
            <Route path="thesis" element={<StudentThesisList />} />
            <Route path="thesis/submit" element={<StudentThesisSubmit />} />
            <Route path="thesis/:id" element={<StudentThesisDetail />} />
            <Route path="revision/:id" element={<StudentRevision />} />
          </Routes>
        </MainLayout>
      } />

      <Route path="/supervisor/*" element={
        !isLoggedIn() ? <Navigate to="/login" replace /> :
        <MainLayout role="SUPERVISOR">
          <Routes>
            <Route index element={<SupervisorDashboard />} />
            <Route path="confirmations" element={<SupervisorConfirmList />} />
          </Routes>
        </MainLayout>
      } />

      <Route path="/secretary/*" element={
        !isLoggedIn() ? <Navigate to="/login" replace /> :
        <MainLayout role="COLLEGE_SECRETARY">
          <Routes>
            <Route index element={<SecretaryDashboard />} />
            <Route path="pending-review" element={<SecretaryReviewList />} />
            <Route path="thesis" element={<SecretaryThesisList />} />
          </Routes>
        </MainLayout>
      } />

      <Route path="/graduate/*" element={
        !isLoggedIn() ? <Navigate to="/login" replace /> :
        <MainLayout role="GRADUATE_SCHOOL">
          <Routes>
            <Route index element={<GraduateDashboard />} />
            <Route path="expert-match" element={<GraduateExpertMatch />} />
            <Route path="review-progress" element={<GraduateReviewProgress />} />
            <Route path="defense-qualification" element={<GraduateDefenseQualification />} />
            <Route path="system" element={<GraduateSystem />} />
          </Routes>
        </MainLayout>
      } />

      <Route path="/expert/*" element={
        !isLoggedIn() ? <Navigate to="/login" replace /> :
        <MainLayout role="EXTERNAL_REVIEWER">
          <Routes>
            <Route index element={<ExpertDashboard />} />
            <Route path="invitations" element={<ExpertInvitationList />} />
            <Route path="review/:invitationId" element={<ExpertReview />} />
          </Routes>
        </MainLayout>
      } />

      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  )
}

export default App
