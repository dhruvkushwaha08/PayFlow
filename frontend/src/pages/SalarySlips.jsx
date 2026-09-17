import { useEffect, useMemo, useState } from 'react'
import { getToken } from '../services/auth'

const API_URL = 'http://localhost:8080/api'

function SalarySlips() {
  const [payrollRecords, setPayrollRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSalarySlips()
  }, [])

  async function loadSalarySlips() {
    try {
      setLoading(true)
      setError('')

      const token = getToken()

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [payrollResponse, employeesResponse] =
        await Promise.all([
          fetch(`${API_URL}/payroll`, {
            headers: authHeaders
          }),
          fetch(`${API_URL}/employees`, {
            headers: authHeaders
          })
        ])

      if (!payrollResponse.ok) {
        throw new Error('Failed to load payroll records.')
      }

      if (!employeesResponse.ok) {
        throw new Error('Failed to load employees.')
      }

      const payrollData = await payrollResponse.json()
      const employeeData = await employeesResponse.json()

      const payroll = Array.isArray(payrollData)
        ? payrollData
        : []

      const employeeList = Array.isArray(employeeData)
        ? employeeData
        : []

      setPayrollRecords(payroll)
      setEmployees(employeeList)

      if (payroll.length > 0) {
        setSelectedId(
          String(payroll[0].payrollId || payroll[0].id)
        )
      } else {
        setSelectedId('')
      }
    } catch (err) {
      console.error(err)
      setError(
        err.message || 'Unable to load salary slips.'
      )
    } finally {
      setLoading(false)
    }
  }

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

    return employee.employeeCode || `#${employee.employeeId}`
  }

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

  function formatDateTime(value) {
    if (!value) {
      return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const selectedPayroll = useMemo(() => {
    return payrollRecords.find(
      payroll =>
        String(
          payroll.payrollId || payroll.id
        ) === String(selectedId)
    )
  }, [payrollRecords, selectedId])

  const employeeName = selectedPayroll
    ? getEmployeeName(selectedPayroll.employeeId)
    : '-'

  const employeeCode = selectedPayroll
    ? getEmployeeCode(selectedPayroll.employeeId)
    : '-'

  function handlePrint() {
    const salarySlip = document.querySelector(
      '.salary-slip-card'
    )

    if (!salarySlip) {
      setError('Salary slip is not ready to print.')
      return
    }

    const printWindow = window.open(
      '',
      '_blank',
      'width=900,height=1200'
    )

    if (!printWindow) {
      setError(
        'Please allow pop-ups in your browser to print the salary slip.'
      )
      return
    }

    const styles = Array.from(
      document.querySelectorAll(
        'link[rel="stylesheet"], style'
      )
    )
      .map(element => {
        if (
          element.tagName.toLowerCase() === 'link'
        ) {
          return `<link rel="stylesheet" href="${element.href}">`
        }

        return `<style>${element.innerHTML}</style>`
      })
      .join('')

    printWindow.document.open()

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Salary Slip - ${employeeName}</title>
          ${styles}

          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              min-height: 0 !important;
              background: #ffffff !important;
              overflow: visible !important;
            }

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body,
            body * {
              visibility: visible !important;
            }

            .print-wrapper {
              display: block !important;
              visibility: visible !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .salary-slip-card {
              display: block !important;
              visibility: visible !important;
              position: static !important;
              width: 100% !important;
              max-width: none !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              overflow: visible !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .salary-slip-header,
            .salary-slip-employee,
            .salary-slip-meta,
            .salary-slip-section,
            .salary-slip-net,
            .salary-slip-note,
            .salary-slip-footer {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .salary-slip-actions,
            .print-button,
            button {
              display: none !important;
            }

            .salary-slip-body {
              padding: 22px !important;
            }

            .salary-slip-section {
              margin-top: 16px !important;
            }

            .salary-slip-row {
              padding: 8px 0 !important;
            }

            .salary-slip-total {
              margin-top: 10px !important;
              padding: 12px 16px !important;
            }

            .salary-slip-net {
              margin-top: 16px !important;
              padding: 16px 18px !important;
            }

            .salary-slip-note {
              margin-top: 14px !important;
              padding: 12px 15px !important;
            }

            .salary-slip-footer {
              padding: 12px 22px !important;
            }

            @media print {
              html body,
              html body * {
                visibility: visible !important;
              }

              html body .print-wrapper,
              html body .salary-slip-card,
              html body .salary-slip-card * {
                visibility: visible !important;
              }
            }
          </style>
        </head>

        <body>
          <div class="print-wrapper">
            ${salarySlip.outerHTML}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
      }, 400)
    }

    printWindow.onafterprint = () => {
      printWindow.close()
    }
  }

  return (
    <div className="page salary-slips-page">

      <div className="page-heading">

        <div>
          <p className="page-eyebrow">
            EMPLOYEE DOCUMENTS
          </p>

          <h1>Salary Slips</h1>

          <p>
            View and print monthly salary slips for your employees.
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={loadSalarySlips}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {loading ? (

        <div className="dashboard-card empty-state">

          <div className="empty-state-icon">
            🧾
          </div>

          <h3>
            Loading salary slips...
          </h3>

          <p>
            Please wait while PayFlow loads your payroll records.
          </p>

        </div>

      ) : payrollRecords.length === 0 ? (

        <div className="dashboard-card empty-state">

          <div className="empty-state-icon">
            🧾
          </div>

          <h3>
            No salary slips available
          </h3>

          <p>
            Generate payroll first to create salary slips.
          </p>

        </div>

      ) : (

        <>

          <div className="dashboard-card salary-slip-selector">

            <div className="section-heading">

              <div>

                <h2>
                  Select Salary Slip
                </h2>

                <p>
                  Choose a payroll record to view its salary slip.
                </p>

              </div>

            </div>

            <div className="salary-slip-controls">

              <div className="form-group">

                <label>
                  Payroll Record
                </label>

                <select
                  value={selectedId}
                  onChange={event =>
                    setSelectedId(event.target.value)
                  }
                >

                  {payrollRecords.map(payroll => {

                    const payrollId =
                      payroll.payrollId || payroll.id

                    return (
                      <option
                        key={payrollId}
                        value={payrollId}
                      >
                        {getEmployeeName(
                          payroll.employeeId
                        )}
                        {' — '}
                        {formatMonth(
                          payroll.payrollMonth
                        )}
                      </option>
                    )
                  })}

                </select>

              </div>

            </div>

          </div>

          {selectedPayroll && (

            <div className="salary-slip-container">

              <div className="salary-slip-card">

                <div className="salary-slip-header">

                  <div>

                    <div className="salary-slip-brand">
                      PayFlow
                    </div>

                    <p>
                      Salary Management System
                    </p>

                  </div>

                  <div className="salary-slip-title">

                    <span>
                      SALARY SLIP
                    </span>

                    <strong>
                      {formatMonth(
                        selectedPayroll.payrollMonth
                      )}
                    </strong>

                  </div>

                </div>

                <div className="salary-slip-employee">

                  <div className="salary-slip-avatar">

                    {employeeName
                      .charAt(0)
                      .toUpperCase()}

                  </div>

                  <div>

                    <h2>
                      {employeeName}
                    </h2>

                    <p>
                      Employee ID: {employeeCode}
                    </p>

                  </div>

                  <div className="salary-slip-status">

                    <span
                      className={`status-badge ${
                        selectedPayroll.status?.toUpperCase() ===
                        'FINALIZED'
                          ? 'status-finalized'
                          : 'status-draft'
                      }`}
                    >
                      {selectedPayroll.status?.toUpperCase() ===
                      'FINALIZED'
                        ? 'Finalized'
                        : 'Draft'}
                    </span>

                  </div>

                </div>

                <div className="salary-slip-meta">

                  <div>

                    <span>
                      Payroll ID
                    </span>

                    <strong>
                      #
                      {selectedPayroll.payrollId ||
                        selectedPayroll.id}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Payroll Month
                    </span>

                    <strong>
                      {formatMonth(
                        selectedPayroll.payrollMonth
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Days Worked
                    </span>

                    <strong>
                      {Number(
                        selectedPayroll.daysWorked || 0
                      ).toFixed(1)}
                      {' / '}
                      {selectedPayroll.daysInMonth || 0}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Generated
                    </span>

                    <strong>
                      {formatDateTime(
                        selectedPayroll.generatedAt
                      )}
                    </strong>

                  </div>

                </div>

                <div className="salary-slip-section">

                  <div className="salary-slip-section-title">
                    Earnings
                  </div>

                  <div className="salary-slip-row">

                    <span>
                      Base Salary
                    </span>

                    <strong>
                      {formatMoney(
                        selectedPayroll.baseSalary
                      )}
                    </strong>

                  </div>

                  <div className="salary-slip-row">

                    <span>
                      Earned Salary
                    </span>

                    <strong>
                      {formatMoney(
                        selectedPayroll.earnedSalary
                      )}
                    </strong>

                  </div>

                  <div className="salary-slip-row">

                    <span>
                      Bonus
                    </span>

                    <strong>
                      {formatMoney(
                        selectedPayroll.bonusAmount
                      )}
                    </strong>

                  </div>

                  <div className="salary-slip-row">

                    <span>
                      Overtime
                    </span>

                    <strong>
                      {formatMoney(
                        selectedPayroll.overtimeAmount
                      )}
                    </strong>

                  </div>

                  <div className="salary-slip-total">

                    <span>
                      Total Earnings
                    </span>

                    <strong>
                      {formatMoney(
                        Number(
                          selectedPayroll.earnedSalary || 0
                        ) +
                        Number(
                          selectedPayroll.bonusAmount || 0
                        ) +
                        Number(
                          selectedPayroll.overtimeAmount || 0
                        )
                      )}
                    </strong>

                  </div>

                </div>

                <div className="salary-slip-section">

                  <div className="salary-slip-section-title">
                    Deductions
                  </div>

                  <div className="salary-slip-row">

                    <span>
                      Salary Advance
                    </span>

                    <strong>
                      −
                      {formatMoney(
                        selectedPayroll.advanceDeduction
                      )}
                    </strong>

                  </div>

                  <div className="salary-slip-row">

                    <span>
                      Other Deductions
                    </span>

                    <strong>
                      −
                      {formatMoney(
                        selectedPayroll.otherDeductions
                      )}
                    </strong>

                  </div>

                  <div className="salary-slip-total">

                    <span>
                      Total Deductions
                    </span>

                    <strong>
                      {formatMoney(
                        Number(
                          selectedPayroll.advanceDeduction || 0
                        ) +
                        Number(
                          selectedPayroll.otherDeductions || 0
                        )
                      )}
                    </strong>

                  </div>

                </div>

                <div className="salary-slip-net">

                  <div>

                    <span>
                      NET SALARY
                    </span>

                    <p>
                      Amount payable to employee
                    </p>

                  </div>

                  <strong>
                    {formatMoney(
                      selectedPayroll.netSalary
                    )}
                  </strong>

                </div>

                <div className="salary-slip-note">

                  <strong>
                    Payroll calculation
                  </strong>

                  <p>
                    Earned salary is calculated from the
                    employee's base salary and payable
                    attendance days. Bonuses and overtime
                    are added, while eligible salary
                    advances and other deductions are
                    subtracted.
                  </p>

                </div>

                <div className="salary-slip-footer">

                  <span>
                    Generated by PayFlow
                  </span>

                  <span>
                    Otaku Heaven
                  </span>

                </div>

              </div>

              <div className="salary-slip-actions">

                <button
                  className="primary-button"
                  type="button"
                  onClick={handlePrint}
                >
                  🖨 Print Salary Slip
                </button>

              </div>

            </div>

          )}

        </>

      )}

    </div>
  )
}

export default SalarySlips