import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:8080/api/employees'

function Employees() {
  const navigate = useNavigate()

  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    businessId: 1,
    roleId: 1,
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    joiningDate: '',
  })

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Failed to load employees')
      }

      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleAddEmployee = async (event) => {
    event.preventDefault()

    try {
      setError('')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          businessId: Number(form.businessId),
          roleId: Number(form.roleId),
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to add employee')
      }

      setShowModal(false)

      setForm({
        businessId: 1,
        roleId: 1,
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        joiningDate: '',
      })

      fetchEmployees()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeactivate = async (employeeId) => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate this employee?'
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      const response = await fetch(`${API_URL}/${employeeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to deactivate employee')
      }

      fetchEmployees()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const fullName =
      `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase()

    const searchMatch =
      fullName.includes(search.toLowerCase()) ||
      employee.employeeCode?.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase())

    const statusMatch =
      statusFilter === 'ALL' || employee.status === statusFilter

    return searchMatch && statusMatch
  })

  const activeCount = employees.filter(
    (employee) => employee.status === 'ACTIVE'
  ).length

  const inactiveCount = employees.filter(
    (employee) => employee.status === 'INACTIVE'
  ).length

  return (
    <div className="employees-page">

      {/* PAGE HEADER */}
      <div className="employees-header">
        <div>
          <p className="eyebrow peach-eyebrow">TEAM MANAGEMENT</p>

          <h1>Employees</h1>

          <p className="page-subtitle">
            Manage your team, employee details and employment status.
          </p>
        </div>

        <button
          className="primary-button peach-button"
          onClick={() => setShowModal(true)}
        >
          + Add Employee
        </button>
      </div>

      {/* SUMMARY */}
      <div className="employee-summary">

        <div className="employee-summary-card peach-card">
          <span>Total Employees</span>
          <strong>{employees.length}</strong>
          <small>All employees</small>
        </div>

        <div className="employee-summary-card mint-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
          <small>Currently working</small>
        </div>

        <div className="employee-summary-card lavender-card">
          <span>Inactive</span>
          <strong>{inactiveCount}</strong>
          <small>Not currently active</small>
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* EMPLOYEE TABLE CARD */}
      <div className="employees-card">

        <div className="employees-card-header">

          <div>
            <h2>All Employees</h2>
            <p>View and manage everyone in your business.</p>
          </div>

          <div className="employee-filters">

            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="page-state">
            <div className="loading-circle"></div>
            <p>Loading employees...</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredEmployees.length === 0 && (
          <div className="page-state">
            <div className="empty-icon">👥</div>
            <h3>No employees found</h3>
            <p>
              Try changing your search or add a new employee.
            </p>
          </div>
        )}

        {/* TABLE */}
        {!loading && filteredEmployees.length > 0 && (
          <div className="table-wrapper">

            <table className="employees-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Role</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredEmployees.map((employee) => (

                  <tr key={employee.employeeId}>

                    <td>
                      <div className="employee-name-cell">

                        <div className="employee-avatar">
                          {employee.firstName?.charAt(0)}
                        </div>

                        <div>
                          <strong>
                            {employee.firstName} {employee.lastName || ''}
                          </strong>

                          <span>
                            {employee.email || 'No email added'}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="employee-code">
                        {employee.employeeCode}
                      </span>
                    </td>

                    <td>
                      Role #{employee.roleId}
                    </td>

                    <td>
                      {employee.joiningDate}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          employee.status === 'ACTIVE'
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        <span></span>
                        {employee.status}
                      </span>
                    </td>

                    <td>

                      {employee.status === 'ACTIVE' && (
                        <button
                          className="table-action danger-action"
                          onClick={() =>
                            handleDeactivate(employee.employeeId)
                          }
                        >
                          Deactivate
                        </button>
                      )}

                      {employee.status === 'INACTIVE' && (
                        <span className="inactive-text">
                          Inactive
                        </span>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ADD EMPLOYEE MODAL */}
      {showModal && (

        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="employee-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <p className="eyebrow peach-eyebrow">
                  NEW TEAM MEMBER
                </p>

                <h2>Add Employee</h2>

                <p>
                  Add a new employee to your business.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAddEmployee}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Employee Code</label>
                  <input
                    name="employeeCode"
                    value={form.employeeCode}
                    onChange={handleInputChange}
                    placeholder="EMP006"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role ID</label>
                  <input
                    type="number"
                    name="roleId"
                    value={form.roleId}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    placeholder="Tanjiro"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    placeholder="Kamado"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="employee@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                  />
                </div>

                <div className="form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button peach-button"
                >
                  Add Employee
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Employees