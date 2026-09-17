import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

function Advances() {
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    amount: "",
    advanceDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [advanceResponse, employeeResponse] = await Promise.all([
        fetch(`${API_URL}/advances`),
        fetch(`${API_URL}/employees`),
      ]);

      if (!advanceResponse.ok) {
        throw new Error("Unable to load advance records.");
      }

      if (!employeeResponse.ok) {
        throw new Error("Unable to load employees.");
      }

      const advanceData = await advanceResponse.json();
      const employeeData = await employeeResponse.json();

      setAdvances(Array.isArray(advanceData) ? advanceData : []);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load advances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const employeeMap = {};

  employees.forEach((employee) => {
    employeeMap[employee.employeeId] = employee;
  });

  const getEmployeeName = (employeeId) => {
    const employee = employeeMap[employeeId];

    if (!employee) {
      return `Employee #${employeeId}`;
    }

    return `${employee.firstName || ""} ${
      employee.lastName || ""
    }`.trim();
  };

  const getEmployeeCode = (employeeId) => {
    const employee = employeeMap[employeeId];

    return employee?.employeeCode || `EMP-${employeeId}`;
  };

  const pendingAdvances = advances.filter(
    (advance) => advance.status === "PENDING"
  );

  const deductedAdvances = advances.filter(
    (advance) => advance.status === "DEDUCTED"
  );

  const cancelledAdvances = advances.filter(
    (advance) => advance.status === "CANCELLED"
  );

  const pendingAmount = pendingAdvances.reduce(
    (total, advance) => total + Number(advance.amount || 0),
    0
  );

  const deductedAmount = deductedAdvances.reduce(
    (total, advance) => total + Number(advance.amount || 0),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API_URL}/advances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: Number(form.employeeId),
          amount: Number(form.amount),
          advanceDate: form.advanceDate,
          notes: form.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create advance."
        );
      }

      setAdvances((previous) => [data, ...previous]);

      setForm({
        employeeId: "",
        amount: "",
        advanceDate: new Date().toISOString().split("T")[0],
        notes: "",
      });

      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save advance.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (advanceId, status) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/advances/${advanceId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to update advance."
        );
      }

      setAdvances((previous) =>
        previous.map((advance) =>
          advance.advanceId === advanceId ? data : advance
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update advance.");
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStatus = (status) => {
    if (!status) return "";

    return (
      status.charAt(0) +
      status.slice(1).toLowerCase()
    );
  };

  return (
    <div className="advances-page">

      {/* HEADER */}
      <div className="advances-header">
        <div>
          <div className="advances-eyebrow">
            PAYROLL MANAGEMENT
          </div>

          <h1>Advances</h1>

          <p className="page-subtitle">
            Track employee salary advances and their deduction status.
          </p>
        </div>

        <button
          className="primary-button advances-button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          + Add Advance
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="advances-summary">

        <div className="advances-summary-card advances-sky">
          <div className="advances-icon">💰</div>

          <div>
            <span>Total Advances</span>

            <strong>{formatCurrency(
              advances.reduce(
                (total, advance) =>
                  total + Number(advance.amount || 0),
                0
              )
            )}</strong>

            <small>
              All recorded advances
            </small>
          </div>
        </div>

        <div className="advances-summary-card advances-yellow">
          <div className="advances-icon">◷</div>

          <div>
            <span>Pending</span>

            <strong>
              {formatCurrency(pendingAmount)}
            </strong>

            <small>
              Awaiting deduction
            </small>
          </div>
        </div>

        <div className="advances-summary-card advances-mint">
          <div className="advances-icon">✓</div>

          <div>
            <span>Deducted</span>

            <strong>
              {formatCurrency(deductedAmount)}
            </strong>

            <small>
              Already deducted
            </small>
          </div>
        </div>

        <div className="advances-summary-card advances-peach">
          <div className="advances-icon">×</div>

          <div>
            <span>Cancelled</span>

            <strong>
              {cancelledAdvances.length}
            </strong>

            <small>
              Cancelled requests
            </small>
          </div>
        </div>

      </div>

      {/* INFO */}
      <div className="advances-info">
        <div className="advances-info-icon">
          💡
        </div>

        <div>
          <strong>How advances work</strong>

          <p>
            New advances start as Pending. PayFlow deducts eligible
            pending advances when payroll is finalized.
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="advances-card">

        <div className="advances-card-header">

          <div>
            <h2>Advance Records</h2>

            <p>
              View and manage employee salary advances.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadData}
          >
            ↻ Refresh
          </button>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="page-state">
            <div className="loading-circle"></div>

            <h3>Loading advances...</h3>

            <p>
              Please wait while PayFlow loads the records.
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && advances.length === 0 && (
          <div className="page-state">

            <div className="empty-icon advances-empty-icon">
              💰
            </div>

            <h3>No advances recorded</h3>

            <p>
              Add an employee advance to get started.
            </p>

            <button
              className="primary-button advances-button"
              onClick={() => setShowModal(true)}
            >
              + Add Advance
            </button>

          </div>
        )}

        {/* TABLE */}
        {!loading && advances.length > 0 && (
          <div className="table-wrapper">

            <table className="advances-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {advances.map((advance) => (

                  <tr key={advance.advanceId}>

                    <td>
                      <div className="advance-employee">

                        <div className="advance-avatar">
                          {getEmployeeName(
                            advance.employeeId
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getEmployeeName(
                              advance.employeeId
                            )}
                          </strong>

                          <span>
                            {getEmployeeCode(
                              advance.employeeId
                            )}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <strong className="advance-amount">
                        {formatCurrency(advance.amount)}
                      </strong>
                    </td>

                    <td>
                      {advance.advanceDate}
                    </td>

                    <td>

                      <span
                        className={`advance-status advance-${(
                          advance.status || ""
                        ).toLowerCase()}`}
                      >
                        <span className="status-dot"></span>

                        {formatStatus(advance.status)}
                      </span>

                    </td>

                    <td>
                      <span className="advance-note">
                        {advance.notes || "—"}
                      </span>
                    </td>

                    <td>

                      {advance.status === "PENDING" && (
                        <div className="advance-actions">

                          <button
                            className="advance-action deduct"
                            onClick={() =>
                              updateStatus(
                                advance.advanceId,
                                "DEDUCTED"
                              )
                            }
                          >
                            Mark deducted
                          </button>

                          <button
                            className="advance-action cancel"
                            onClick={() =>
                              updateStatus(
                                advance.advanceId,
                                "CANCELLED"
                              )
                            }
                          >
                            Cancel
                          </button>

                        </div>
                      )}

                      {advance.status !== "PENDING" && (
                        <span className="advance-locked">
                          Locked
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

      {/* ADD ADVANCE MODAL */}
      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >

          <div className="advance-modal">

            <div className="modal-header">

              <div>
                <div className="advances-eyebrow">
                  SALARY ADVANCE
                </div>

                <h2>Add Advance</h2>

                <p>
                  Record an advance received by an employee.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Employee *
                  </label>

                  <select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select employee
                    </option>

                    {employees
                      .filter(
                        (employee) =>
                          employee.status === "ACTIVE"
                      )
                      .map((employee) => (

                        <option
                          key={employee.employeeId}
                          value={employee.employeeId}
                        >
                          {employee.employeeCode} —{" "}
                          {employee.firstName}{" "}
                          {employee.lastName || ""}
                        </option>

                      ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Amount *
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="5000"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Advance Date *
                  </label>

                  <input
                    type="date"
                    name="advanceDate"
                    value={form.advanceDate}
                    onChange={handleChange}
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Notes
                  </label>

                  <input
                    type="text"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Optional note"
                  />

                </div>

              </div>

              <div className="advances-form-info">

                <span>ℹ</span>

                <p>
                  This advance will be created with Pending
                  status and can later be deducted or cancelled.
                </p>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button advances-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Advance"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Advances;