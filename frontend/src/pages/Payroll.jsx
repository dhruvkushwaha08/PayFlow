import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8080/api'

function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState([])
  const [employees, setEmployees] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finalizingId, setFinalizingId] = useState(null)

  const [form, setForm] = useState({
    employeeId: '',
    payrollMonth: new Date().toISOString().slice(0, 7)
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [payrollResponse, employeesResponse] = await Promise.all([
        fetch(`${API_URL}/payroll`),
        fetch(`${API_URL}/employees`)
      ])

      if (!payrollResponse.ok) {
        throw new Error('Failed to load payroll records')
      }

      if (!employeesResponse.ok) {
        throw new Error('Failed to load employees')
      }

      const payrollData = await payrollResponse.json()
      const employeeData = await employeesResponse.json()

      setPayrollRecords(
        Array.isArray(payrollData) ? payrollData : []
      )

      setEmployees(
        Array.isArray(employeeData) ? employeeData : []
      )
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to fetch payroll data.')
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------
  // EMPLOYEE HELPERS
  // ---------------------------------------------------------

  function getEmployee(employeeId) {
    return employees.find(
      employee =>
        Number(employee.employeeId) === Number(employeeId)
    )
  }

  function getEmployeeName(employeeId) {
    const employee = getEmployee(employeeId)

    if (!employee) {
      return `Employee #${employeeId}`
    }

    return `${employee.firstName || ''} ${
      employee.lastName || ''
    }`.trim()
  }

  function getEmployeeCode(employeeId) {
    const employee = getEmployee(employeeId)

    if (!employee) {
      return `#${employeeId}`
    }

    return (
      employee.employeeCode ||
      `#${employee.employeeId}`
    )
  }

  // ---------------------------------------------------------
  // FORMATTING
  // ---------------------------------------------------------

  function formatMoney(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  function formatMonth(value) {
    if (!value) {
      return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    })
  }

  // ---------------------------------------------------------
  // FORM HANDLING
  // ---------------------------------------------------------

  function handleFormChange(event) {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  function openGenerateModal() {
    setForm({
      employeeId: '',
      payrollMonth: new Date().toISOString().slice(0, 7)
    })

    setError('')
    setShowModal(true)
  }

  function closeGenerateModal() {
    if (!saving) {
      setShowModal(false)
    }
  }

  // ---------------------------------------------------------
  // GENERATE PAYROLL
  // ---------------------------------------------------------

  async function handleGenerate(event) {
    event.preventDefault()

    if (!form.employeeId || !form.payrollMonth) {
      alert('Please select an employee and payroll month.')
      return
    }

    try {
      setSaving(true)
      setError('')

      /*
       * Backend expects payrollMonth as LocalDate.
       * Therefore we send the first day of the selected month.
       *
       * Example:
       * September 2026 -> 2026-09-01
       */

      const payrollMonth = `${form.payrollMonth}-01`

      const response = await fetch(
        `${API_URL}/payroll/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            employeeId: Number(form.employeeId),
            payrollMonth
          })
        }
      )

      if (!response.ok) {
        const message = await response.text()

        throw new Error(
          message || 'Unable to generate payroll.'
        )
      }

      setShowModal(false)

      await loadData()

    } catch (err) {
      console.error(err)
      setError(
        err.message || 'Failed to generate payroll.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------
  // FINALIZE PAYROLL
  // ---------------------------------------------------------

  async function handleFinalize(payrollId) {
    const confirmed = window.confirm(
      'Finalize this payroll?\n\nOnce finalized, the payroll cannot be finalized again and included advances will be marked as deducted.'
    )

    if (!confirmed) {
      return
    }

    try {
      setFinalizingId(payrollId)
      setError('')

      const response = await fetch(
        `${API_URL}/payroll/${payrollId}/finalize`,
        {
          method: 'PATCH'
        }
      )

      if (!response.ok) {
        const message = await response.text()

        throw new Error(
          message || 'Unable to finalize payroll.'
        )
      }

      await loadData()

    } catch (err) {
      console.error(err)
      setError(
        err.message || 'Failed to finalize payroll.'
      )
    } finally {
      setFinalizingId(null)
    }
  }

  // ---------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------

  const totalPayroll = payrollRecords.reduce(
    (total, payroll) =>
      total + Number(payroll.netSalary || 0),
    0
  )

  const totalRecords = payrollRecords.length

  const finalizedCount = payrollRecords.filter(
    payroll =>
      payroll.status?.toUpperCase() === 'FINALIZED'
  ).length

  const draftCount = payrollRecords.filter(
    payroll =>
      payroll.status?.toUpperCase() === 'DRAFT'
  ).length

  return (
    <div className="page payroll-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-heading">

        <div>

          <p className="page-eyebrow">
            MONTHLY PAYROLL
          </p>

          <h1>
            Payroll
          </h1>

          <p>
            Generate, review and finalize employee payroll.
          </p>

        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openGenerateModal}
        >
          + Generate Payroll
        </button>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="stats-grid">

        {/* TOTAL PAYROLL */}

        <div className="stat-card lavender">

          <div className="stat-icon">
            ₹
          </div>

          <div className="stat-label">
            Total Payroll
          </div>

          <div className="stat-value">
            {formatMoney(totalPayroll)}
          </div>

          <div className="stat-description">
            Combined net salary
          </div>

        </div>


        {/* PAYROLL RECORDS */}

        <div className="stat-card peach">

          <div className="stat-icon">
            #
          </div>

          <div className="stat-label">
            Payroll Records
          </div>

          <div className="stat-value">
            {totalRecords}
          </div>

          <div className="stat-description">
            Generated payrolls
          </div>

        </div>


        {/* FINALIZED */}

        <div className="stat-card mint">

          <div className="stat-icon">
            ✓
          </div>

          <div className="stat-label">
            Finalized
          </div>

          <div className="stat-value">
            {finalizedCount}
          </div>

          <div className="stat-description">
            Completed payrolls
          </div>

        </div>


        {/* DRAFT */}

        <div className="stat-card sky">

          <div className="stat-icon">
            ◷
          </div>

          <div className="stat-label">
            Draft Payroll
          </div>

          <div className="stat-value">
            {draftCount}
          </div>

          <div className="stat-description">
            Awaiting finalization
          </div>

        </div>

      </div>


      {/* =====================================================
          INFORMATION CARD
      ===================================================== */}

      <div className="dashboard-card payroll-info-card">

        <div className="info-icon">
          💡
        </div>

        <div>

          <h3>
            How payroll is calculated
          </h3>

          <p>
            PayFlow automatically combines attendance,
            salary structure, bonuses, overtime and eligible
            salary advances to calculate the employee's
            monthly net salary.
          </p>

        </div>

      </div>


      {/* =====================================================
          PAYROLL TABLE
      ===================================================== */}

      <div className="dashboard-card">

        <div className="section-heading">

          <div>

            <h2>
              Payroll Records
            </h2>

            <p>
              Review monthly salary calculations for employees.
            </p>

          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={loadData}
            disabled={loading}
          >
            ↻ Refresh
          </button>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="empty-state">

            <div className="empty-state-icon">
              💰
            </div>

            <h3>
              Loading payroll...
            </h3>

            <p>
              Please wait while PayFlow loads payroll records.
            </p>

          </div>


        ) : payrollRecords.length === 0 ? (

          /* =================================================
             EMPTY STATE
             ================================================= */

          <div className="empty-state">

            <div className="empty-state-icon">
              💰
            </div>

            <h3>
              No payroll records
            </h3>

            <p>
              Generate payroll for an employee to see
              their monthly salary calculation here.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={openGenerateModal}
            >
              + Generate Payroll
            </button>

          </div>


        ) : (

          /* =================================================
             PAYROLL TABLE
             ================================================= */

          <div className="table-wrapper">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Month
                  </th>

                  <th>
                    Days Worked
                  </th>

                  <th>
                    Earned Salary
                  </th>

                  <th>
                    Bonus
                  </th>

                  <th>
                    Overtime
                  </th>

                  <th>
                    Advance
                  </th>

                  <th>
                    Net Salary
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {payrollRecords.map(payroll => {

                  const status =
                    payroll.status?.toUpperCase() || 'DRAFT'

                  const isFinalized =
                    status === 'FINALIZED'

                  const payrollId =
                    payroll.payrollId || payroll.id

                  return (

                    <tr key={payrollId}>

                      {/* EMPLOYEE */}

                      <td>

                        <div className="employee-cell">

                          <div className="employee-avatar small">

                            {getEmployeeName(
                              payroll.employeeId
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {getEmployeeName(
                                payroll.employeeId
                              )}
                            </strong>

                            <span>
                              {getEmployeeCode(
                                payroll.employeeId
                              )}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* MONTH */}

                      <td>
                        {formatMonth(
                          payroll.payrollMonth
                        )}
                      </td>


                      {/* DAYS WORKED */}

                      <td>

                        <strong>
                          {Number(
                            payroll.daysWorked || 0
                          ).toFixed(1)}
                        </strong>

                        <span className="table-secondary">
                          {' '} / {payroll.daysInMonth || 0} days
                        </span>

                      </td>


                      {/* EARNED SALARY */}

                      <td>
                        {formatMoney(
                          payroll.earnedSalary
                        )}
                      </td>


                      {/* BONUS */}

                      <td>
                        {formatMoney(
                          payroll.bonusAmount
                        )}
                      </td>


                      {/* OVERTIME */}

                      <td>
                        {formatMoney(
                          payroll.overtimeAmount
                        )}
                      </td>


                      {/* ADVANCE */}

                      <td>

                        <span className="deduction-amount">

                          −
                          {formatMoney(
                            payroll.advanceDeduction
                          )}

                        </span>

                      </td>


                      {/* NET SALARY */}

                      <td>

                        <strong className="net-salary">

                          {formatMoney(
                            payroll.netSalary
                          )}

                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`status-badge ${
                            isFinalized
                              ? 'status-finalized'
                              : 'status-draft'
                          }`}
                        >

                          {isFinalized
                            ? 'Finalized'
                            : 'Draft'}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        {!isFinalized ? (

                          <button
                            className="table-action-button"
                            type="button"
                            onClick={() =>
                              handleFinalize(
                                payrollId
                              )
                            }
                            disabled={
                              finalizingId === payrollId
                            }
                          >

                            {finalizingId === payrollId
                              ? 'Finalizing...'
                              : 'Finalize'}

                          </button>

                        ) : (

                          <span className="completed-label">
                            ✓ Complete
                          </span>

                        )}

                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          CALCULATION BREAKDOWN
      ===================================================== */}

      <div className="dashboard-card payroll-breakdown-card">

        <div className="section-heading">

          <div>

            <h2>
              Payroll Formula
            </h2>

            <p>
              PayFlow uses the following calculation for
              monthly payroll.
            </p>

          </div>

        </div>


        <div className="formula-box">

          <div className="formula-line">

            <span>
              Earned Salary
            </span>

            <strong>
              Base Salary × Payable Days ÷ Days in Month
            </strong>

          </div>


          <div className="formula-line">

            <span>
              Net Salary
            </span>

            <strong>
              Earned Salary + Bonus + Overtime − Advance
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          GENERATE PAYROLL MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={closeGenerateModal}
        >

          <div
            className="modal payroll-modal"
            onMouseDown={event =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <p className="page-eyebrow">
                  MONTHLY PAYROLL
                </p>

                <h2>
                  Generate Payroll
                </h2>

                <p>
                  Select an employee and payroll month.
                </p>

              </div>


              <button
                className="modal-close"
                type="button"
                onClick={closeGenerateModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form onSubmit={handleGenerate}>

              <div className="form-grid">

                {/* EMPLOYEE */}

                <div className="form-group full-width">

                  <label>
                    Employee <span>*</span>
                  </label>

                  <select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleFormChange}
                    required
                  >

                    <option value="">
                      Select employee
                    </option>


                    {employees
                      .filter(
                        employee =>
                          employee.status?.toUpperCase() !==
                          'INACTIVE'
                      )
                      .map(employee => (

                        <option
                          key={employee.employeeId}
                          value={employee.employeeId}
                        >

                          {`${employee.firstName || ''} ${
                            employee.lastName || ''
                          }`.trim()}

                          {' '}

                          (
                          {employee.employeeCode ||
                            `#${employee.employeeId}`}
                          )

                        </option>

                      ))}

                  </select>

                </div>


                {/* PAYROLL MONTH */}

                <div className="form-group full-width">

                  <label>
                    Payroll Month <span>*</span>
                  </label>

                  <input
                    type="month"
                    name="payrollMonth"
                    value={form.payrollMonth}
                    onChange={handleFormChange}
                    required
                  />

                </div>

              </div>


              {/* INFO */}

              <div className="payroll-modal-note">

                <span>
                  💡
                </span>

                <p>
                  PayFlow will automatically calculate
                  attendance, salary, bonuses, overtime and
                  eligible pending advances for this month.
                </p>

              </div>


              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeGenerateModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >

                  {saving
                    ? 'Generating...'
                    : 'Generate Payroll'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Payroll