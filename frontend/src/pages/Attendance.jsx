import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getToken } from '../services/auth'

const API_URL = 'http://localhost:8080/api'

function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [employees, setEmployees] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [form, setForm] = useState({
    employeeId: '',
    attendanceDate: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    checkIn: '',
    checkOut: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const token = getToken()

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      const [attendanceResponse, employeesResponse] = await Promise.all([
        fetch(`${API_URL}/attendance`, {
          headers: authHeaders,
        }),
        fetch(`${API_URL}/employees`, {
          headers: authHeaders,
        }),
      ])

      if (!attendanceResponse.ok) {
        throw new Error('Failed to fetch attendance records.')
      }

      if (!employeesResponse.ok) {
        throw new Error('Failed to fetch employees.')
      }

      const attendanceData = await attendanceResponse.json()
      const employeeData = await employeesResponse.json()

      setAttendanceRecords(
        Array.isArray(attendanceData) ? attendanceData : []
      )

      setEmployees(
        Array.isArray(employeeData) ? employeeData : []
      )
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  const employeeMap = useMemo(() => {
    const map = {}

    employees.forEach((employee) => {
      map[employee.employeeId] = employee
    })

    return map
  }, [employees])

  function getEmployee(employeeId) {
    return employeeMap[employeeId]
  }

  function getEmployeeName(employeeId) {
    const employee = getEmployee(employeeId)

    if (!employee) {
      return `Employee #${employeeId}`
    }

    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
  }

  function getEmployeeCode(employeeId) {
    const employee = getEmployee(employeeId)

    return employee?.employeeCode || `EMP${String(employeeId).padStart(3, '0')}`
  }

  function getInitials(employeeId) {
    const employee = getEmployee(employeeId)

    if (!employee) return 'E'

    const first = employee.firstName?.charAt(0) || ''
    const last = employee.lastName?.charAt(0) || ''

    return `${first}${last}`.toUpperCase() || 'E'
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'PRESENT':
        return 'Present'
      case 'ABSENT':
        return 'Absent'
      case 'HALF_DAY':
        return 'Half Day'
      case 'LEAVE':
        return 'Leave'
      default:
        return status
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case 'PRESENT':
        return 'attendance-status present'
      case 'ABSENT':
        return 'attendance-status absent'
      case 'HALF_DAY':
        return 'attendance-status half-day'
      case 'LEAVE':
        return 'attendance-status leave'
      default:
        return 'attendance-status'
    }
  }

  function getPayableDays(record) {
    if (record.payableDays !== undefined && record.payableDays !== null) {
      return Number(record.payableDays)
    }

    switch (record.status) {
      case 'PRESENT':
        return 1
      case 'HALF_DAY':
        return 0.5
      default:
        return 0
    }
  }

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const employeeName = getEmployeeName(record.employeeId).toLowerCase()
      const employeeCode = getEmployeeCode(record.employeeId).toLowerCase()

      const searchText = search.toLowerCase().trim()

      const matchesSearch =
        !searchText ||
        employeeName.includes(searchText) ||
        employeeCode.includes(searchText)

      const matchesStatus =
        statusFilter === 'ALL' || record.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [attendanceRecords, search, statusFilter, employeeMap])

  const summary = useMemo(() => {
    const present = attendanceRecords.filter(
      (record) => record.status === 'PRESENT'
    ).length

    const absent = attendanceRecords.filter(
      (record) => record.status === 'ABSENT'
    ).length

    const halfDay = attendanceRecords.filter(
      (record) => record.status === 'HALF_DAY'
    ).length

    const leave = attendanceRecords.filter(
      (record) => record.status === 'LEAVE'
    ).length

    const payableDays = attendanceRecords.reduce(
      (total, record) => total + getPayableDays(record),
      0
    )

    return {
      total: attendanceRecords.length,
      present,
      absent,
      halfDay,
      leave,
      payableDays,
    }
  }, [attendanceRecords])

  function openModal() {
    setFormError('')

    setForm({
      employeeId:
        employees.find((employee) => employee.status === 'ACTIVE')
          ?.employeeId || '',
      attendanceDate: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      checkIn: '',
      checkOut: '',
      notes: '',
    })

    setShowModal(true)
  }

  function closeModal() {
    if (saving) return

    setShowModal(false)
    setFormError('')
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.employeeId) {
      setFormError('Please select an employee.')
      return
    }

    if (!form.attendanceDate) {
      setFormError('Please select an attendance date.')
      return
    }

    if (!form.status) {
      setFormError('Please select an attendance status.')
      return
    }

    try {
      setSaving(true)
      setFormError('')

      const token = getToken()

      const payload = {
        employeeId: Number(form.employeeId),
        attendanceDate: form.attendanceDate,
        status: form.status,
        checkIn:
          form.status === 'ABSENT' || form.status === 'LEAVE'
            ? null
            : form.checkIn || null,
        checkOut:
          form.status === 'ABSENT' || form.status === 'LEAVE'
            ? null
            : form.checkOut || null,
        notes: form.notes.trim() || null,
      }

      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to save attendance record.'
        )
      }

      setShowModal(false)

      await loadData()
    } catch (err) {
      console.error(err)
      setFormError(err.message || 'Unable to save attendance record.')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="attendance-page">
      {/* PAGE HEADER */}
      <div className="page-heading attendance-heading">
        <div>
          <p className="page-eyebrow">DAILY TRACKING</p>

          <h1>Attendance</h1>

          <p className="page-description">
            Track employee attendance and payable working days.
          </p>
        </div>

        <button
          type="button"
          className="primary-button attendance-add-button"
          onClick={openModal}
        >
          + Mark Attendance
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="page-alert error-alert">
          <span>⚠️</span>

          <div>
            <strong>Unable to load attendance</strong>
            <p>{error}</p>
          </div>

          <button type="button" onClick={loadData}>
            Try again
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="stats-grid attendance-stats">
        <div className="stat-card mint">
          <div className="stat-icon">✓</div>

          <div className="stat-content">
            <span className="stat-label">Present</span>
            <strong>{summary.present}</strong>
            <small>Full working days</small>
          </div>
        </div>

        <div className="stat-card peach">
          <div className="stat-icon">—</div>

          <div className="stat-content">
            <span className="stat-label">Absent</span>
            <strong>{summary.absent}</strong>
            <small>No payable day</small>
          </div>
        </div>

        <div className="stat-card lavender">
          <div className="stat-icon">½</div>

          <div className="stat-content">
            <span className="stat-label">Half Days</span>
            <strong>{summary.halfDay}</strong>
            <small>0.5 payable day</small>
          </div>
        </div>

        <div className="stat-card sky">
          <div className="stat-icon">₹</div>

          <div className="stat-content">
            <span className="stat-label">Payable Days</span>
            <strong>{summary.payableDays}</strong>
            <small>Used for payroll</small>
          </div>
        </div>
      </div>

      {/* RECORDS CARD */}
      <div className="dashboard-card attendance-records-card">
        <div className="section-header">
          <div>
            <h2>Attendance Records</h2>

            <p>
              {filteredRecords.length} of {summary.total} attendance entries
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadData}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="attendance-filters">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="LEAVE">Leave</option>
          </select>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner"></div>

            <h3>Loading attendance...</h3>

            <p>Please wait while we fetch the latest records.</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>

            <h3>
              {attendanceRecords.length === 0
                ? 'No attendance records'
                : 'No matching records'}
            </h3>

            <p>
              {attendanceRecords.length === 0
                ? 'Start by marking attendance for an employee.'
                : 'Try changing your search or status filter.'}
            </p>

            {attendanceRecords.length === 0 && (
              <button
                type="button"
                className="primary-button"
                onClick={openModal}
              >
                + Mark Attendance
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table attendance-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>CHECK IN</th>
                  <th>CHECK OUT</th>
                  <th>PAYABLE</th>
                  <th>NOTES</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.attendanceId}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {getInitials(record.employeeId)}
                        </div>

                        <div>
                          <strong>
                            {getEmployeeName(record.employeeId)}
                          </strong>

                          <span>
                            {getEmployeeCode(record.employeeId)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {record.attendanceDate
                        ? new Date(
                            `${record.attendanceDate}T00:00:00`
                          ).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    <td>
                      <span className={getStatusClass(record.status)}>
                        <span className="status-dot"></span>
                        {getStatusLabel(record.status)}
                      </span>
                    </td>

                    <td>{record.checkIn || '—'}</td>

                    <td>{record.checkOut || '—'}</td>

                    <td>
                      <strong>
                        {getPayableDays(record)}{' '}
                        {getPayableDays(record) === 1 ? 'day' : 'days'}
                      </strong>
                    </td>

                    <td className="notes-cell">
                      {record.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYROLL INFO */}
      <div className="info-card attendance-info-card">
        <div className="info-icon">💡</div>

        <div>
          <h3>How attendance affects payroll</h3>

          <p>
            Present counts as 1 payable day, Half Day counts as 0.5 day,
            while Absent and Leave count as 0 payable days.
          </p>

          <Link to="/payroll">View Payroll →</Link>
        </div>
      </div>

      {/* ADD ATTENDANCE MODAL */}
      {showModal && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div
            className="modal-card attendance-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="page-eyebrow">DAILY RECORD</p>

                <h2>Mark Attendance</h2>

                <p>
                  Add attendance details for an employee.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="employeeId">Employee</label>

                  <select
                    id="employeeId"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select employee</option>

                    {employees
                      .filter((employee) => employee.status === 'ACTIVE')
                      .map((employee) => (
                        <option
                          key={employee.employeeId}
                          value={employee.employeeId}
                        >
                          {employee.firstName}{' '}
                          {employee.lastName || ''} —{' '}
                          {employee.employeeCode}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="attendanceDate">Date</label>

                  <input
                    id="attendanceDate"
                    name="attendanceDate"
                    type="date"
                    value={form.attendanceDate}
                    max={today}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="LEAVE">Leave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="checkIn">Check In</label>

                  <input
                    id="checkIn"
                    name="checkIn"
                    type="time"
                    value={form.checkIn}
                    onChange={handleFormChange}
                    disabled={
                      form.status === 'ABSENT' ||
                      form.status === 'LEAVE'
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkOut">Check Out</label>

                  <input
                    id="checkOut"
                    name="checkOut"
                    type="time"
                    value={form.checkOut}
                    onChange={handleFormChange}
                    disabled={
                      form.status === 'ABSENT' ||
                      form.status === 'LEAVE'
                    }
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="notes">Notes</label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    placeholder="Optional note..."
                    value={form.notes}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {formError && (
                <div className="form-error">
                  ⚠️ {formError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance