import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import DashboardLayout from './layouts/DashboardLayout'

import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Advances from './pages/Advances'
import Bonuses from './pages/Bonuses'
import Overtime from './pages/Overtime'
import Payroll from './pages/Payroll'
import SalarySlips from './pages/SalarySlips'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/employees"
          element={
            <DashboardLayout>
              <Employees />
            </DashboardLayout>
          }
        />

        <Route
          path="/attendance"
          element={
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          }
        />

        <Route
          path="/advances"
          element={
            <DashboardLayout>
              <Advances />
            </DashboardLayout>
          }
        />

        <Route
          path="/bonuses"
          element={
            <DashboardLayout>
              <Bonuses />
            </DashboardLayout>
          }
        />

        <Route
          path="/overtime"
          element={
            <DashboardLayout>
              <Overtime />
            </DashboardLayout>
          }
        />

        <Route
          path="/payroll"
          element={
            <DashboardLayout>
              <Payroll />
            </DashboardLayout>
          }
        />

        <Route
          path="/salary-slips"
          element={
            <DashboardLayout>
              <SalarySlips />
            </DashboardLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App