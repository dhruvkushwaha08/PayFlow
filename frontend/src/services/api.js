import { getToken } from './auth'

const API_BASE_URL = 'http://localhost:8080/api'

async function apiRequest(endpoint, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}


/* =========================
   EMPLOYEES
   ========================= */

export async function getEmployees() {
  return apiRequest('/employees')
}

export async function createEmployee(employee) {
  return apiRequest('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  })
}

export async function updateEmployee(employeeId, employee) {
  return apiRequest(`/employees/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  })
}


/* =========================
   ATTENDANCE
   ========================= */

export async function getAttendance() {
  return apiRequest('/attendance')
}

export async function createAttendance(attendance) {
  return apiRequest('/attendance', {
    method: 'POST',
    body: JSON.stringify(attendance),
  })
}


/* =========================
   ADVANCES
   ========================= */

export async function getAdvances() {
  return apiRequest('/advances')
}

export async function createAdvance(advance) {
  return apiRequest('/advances', {
    method: 'POST',
    body: JSON.stringify(advance),
  })
}


/* =========================
   BONUSES
   ========================= */

export async function getBonuses() {
  return apiRequest('/bonuses')
}

export async function createBonus(bonus) {
  return apiRequest('/bonuses', {
    method: 'POST',
    body: JSON.stringify(bonus),
  })
}


/* =========================
   OVERTIME
   ========================= */

export async function getOvertime() {
  return apiRequest('/overtime')
}

export async function createOvertime(overtime) {
  return apiRequest('/overtime', {
    method: 'POST',
    body: JSON.stringify(overtime),
  })
}


/* =========================
   PAYROLL
   ========================= */

export async function getPayroll() {
  return apiRequest('/payroll')
}

export async function generatePayroll(data) {
  return apiRequest('/payroll/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function finalizePayroll(payrollId) {
  return apiRequest(`/payroll/${payrollId}/finalize`, {
    method: 'PATCH',
  })
}


/* =========================
   SALARY SLIPS
   ========================= */

export async function getSalarySlips() {
  return apiRequest('/payroll')
}


/* =========================
   GENERIC HELPERS
   ========================= */

export async function apiGet(endpoint) {
  return apiRequest(endpoint)
}

export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function apiPatch(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function apiDelete(endpoint) {
  return apiRequest(endpoint, {
    method: 'DELETE',
  })
}