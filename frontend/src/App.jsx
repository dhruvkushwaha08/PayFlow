import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Advances from './pages/Advances'
import Bonuses from './pages/Bonuses'
import Overtime from './pages/Overtime'
import Payroll from './pages/Payroll'
import SalarySlips from './pages/SalarySlips'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public route */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Protected application routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Dashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employees"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Employees />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Attendance />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/advances"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Advances />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bonuses"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Bonuses />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/overtime"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Overtime />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payroll"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Payroll />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/salary-slips"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <SalarySlips />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Settings />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Unknown routes */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    )
}

export default App