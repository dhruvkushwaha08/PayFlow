import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:8080/api";

function Overtime() {
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    overtimeDate: new Date().toISOString().split("T")[0],
    hours: "",
    ratePerHour: "100",
    notes: "",
  });

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [overtimeResponse, employeeResponse] = await Promise.all([
        fetch(`${API_URL}/overtime`),
        fetch(`${API_URL}/employees`),
      ]);

      if (!overtimeResponse.ok) {
        throw new Error("Unable to load overtime records.");
      }

      if (!employeeResponse.ok) {
        throw new Error("Unable to load employees.");
      }

      const overtimeData = await overtimeResponse.json();
      const employeeData = await employeeResponse.json();

      setOvertimeRecords(
        Array.isArray(overtimeData) ? overtimeData : []
      );

      setEmployees(
        Array.isArray(employeeData) ? employeeData : []
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load overtime records.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // ACTIVE EMPLOYEES ONLY
  // =========================================================

  const activeEmployees = useMemo(() => {
    return employees.filter(
      (employee) =>
        String(employee.status || "").toUpperCase() === "ACTIVE"
    );
  }, [employees]);

  // =========================================================
  // EMPLOYEE HELPERS
  // =========================================================

  const employeeMap = useMemo(() => {
    const map = {};

    employees.forEach((employee) => {
      map[employee.employeeId] = employee;
    });

    return map;
  }, [employees]);

  function getEmployee(employeeId) {
    return employeeMap[employeeId];
  }

  function getEmployeeName(employeeId) {
    const employee = getEmployee(employeeId);

    if (!employee) {
      return `Employee #${employeeId}`;
    }

    return `${employee.firstName || ""} ${
      employee.lastName || ""
    }`.trim();
  }

  function getEmployeeCode(employeeId) {
    const employee = getEmployee(employeeId);

    return (
      employee?.employeeCode ||
      `EMP${String(employeeId).padStart(3, "0")}`
    );
  }

  function getInitials(employeeId) {
    const employee = getEmployee(employeeId);

    if (!employee) {
      return "E";
    }

    const first = employee.firstName?.charAt(0) || "";
    const last = employee.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "E";
  }

  // =========================================================
  // FORM
  // =========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openModal() {
    setError("");

    setForm({
      employeeId: "",
      overtimeDate: new Date().toISOString().split("T")[0],
      hours: "",
      ratePerHour: "100",
      notes: "",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (!saving) {
      setShowModal(false);
    }
  }

  // =========================================================
  // SAVE OVERTIME
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    // Frontend validation
    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!form.overtimeDate) {
      setError("Please select an overtime date.");
      return;
    }

    if (!form.hours || Number(form.hours) <= 0) {
      setError("Hours must be greater than 0.");
      return;
    }

    if (!form.ratePerHour || Number(form.ratePerHour) <= 0) {
      setError("Rate per hour must be greater than 0.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // IMPORTANT:
      // Convert the selected employee ID to a number.
      const employeeId = Number(form.employeeId);

      if (!Number.isInteger(employeeId) || employeeId <= 0) {
        throw new Error("Invalid employee selected.");
      }

      const requestBody = {
        employeeId: employeeId,
        overtimeDate: form.overtimeDate,
        hours: Number(form.hours),
        ratePerHour: Number(form.ratePerHour),
        notes: form.notes?.trim() || null,
      };

      console.log("Creating overtime:", requestBody);

      const response = await fetch(`${API_URL}/overtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to create overtime record."
        );
      }

      // Add newly created record to the top
      setOvertimeRecords((previous) => [
        data,
        ...previous,
      ]);

      // Reset form
      setForm({
        employeeId: "",
        overtimeDate: new Date().toISOString().split("T")[0],
        hours: "",
        ratePerHour: "100",
        notes: "",
      });

      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save overtime.");
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // FORMATTERS
  // =========================================================

  function formatMoney(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalHours = overtimeRecords.reduce(
    (total, record) =>
      total + Number(record.hours || 0),
    0
  );

  const totalAmount = overtimeRecords.reduce(
    (total, record) =>
      total + Number(record.amount || 0),
    0
  );

  const totalRecords = overtimeRecords.length;

  const averageRate =
    totalRecords > 0
      ? overtimeRecords.reduce(
          (total, record) =>
            total + Number(record.ratePerHour || 0),
          0
        ) / totalRecords
      : 0;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="page overtime-page">

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">EXTRA HOURS</p>

          <h1>Overtime</h1>

          <p>
            Track additional working hours and overtime payments.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openModal}
        >
          + Add Overtime
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="stats-grid overtime-stats">

        <div className="stat-card sky">
          <div className="stat-icon">⏱</div>

          <div className="stat-content">
            <span className="stat-label">
              Total Overtime
            </span>

            <strong>
              {totalHours.toFixed(1)} hrs
            </strong>

            <small>
              All recorded hours
            </small>
          </div>
        </div>

        <div className="stat-card peach">
          <div className="stat-icon">₹</div>

          <div className="stat-content">
            <span className="stat-label">
              Total Amount
            </span>

            <strong>
              {formatMoney(totalAmount)}
            </strong>

            <small>
              Overtime payable
            </small>
          </div>
        </div>

        <div className="stat-card lavender">
          <div className="stat-icon">#</div>

          <div className="stat-content">
            <span className="stat-label">
              Records
            </span>

            <strong>
              {totalRecords}
            </strong>

            <small>
              Overtime entries
            </small>
          </div>
        </div>

        <div className="stat-card mint">
          <div className="stat-icon">₹</div>

          <div className="stat-content">
            <span className="stat-label">
              Average Rate
            </span>

            <strong>
              {formatMoney(averageRate)}
            </strong>

            <small>
              Per hour
            </small>
          </div>
        </div>

      </div>

      {/* INFO */}
      <div className="info-card overtime-info">
        <div className="info-icon">
          💡
        </div>

        <div>
          <h3>
            How overtime works
          </h3>

          <p>
            Overtime is calculated using the recorded hours
            and hourly rate. The calculated amount is included
            automatically in monthly payroll.
          </p>
        </div>
      </div>

      {/* RECORDS */}
      <div className="dashboard-card overtime-records-card">

        <div className="section-header">
          <div>
            <h2>
              Overtime Records
            </h2>

            <p>
              View additional working hours recorded for employees.
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

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner"></div>

            <h3>
              Loading overtime...
            </h3>

            <p>
              Please wait while we fetch the latest records.
            </p>
          </div>
        ) : overtimeRecords.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              ⏱
            </div>

            <h3>
              No overtime records
            </h3>

            <p>
              Start by recording overtime for an employee.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={openModal}
            >
              + Add Overtime
            </button>

          </div>
        ) : (
          <div className="table-wrapper">

            <table className="data-table overtime-table">

              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DATE</th>
                  <th>HOURS</th>
                  <th>RATE / HOUR</th>
                  <th>AMOUNT</th>
                  <th>NOTES</th>
                </tr>
              </thead>

              <tbody>

                {overtimeRecords.map((record) => (
                  <tr
                    key={
                      record.overtimeId ||
                      record.id
                    }
                  >

                    <td>
                      <div className="employee-cell">

                        <div className="employee-avatar">
                          {getInitials(record.employeeId)}
                        </div>

                        <div>
                          <strong>
                            {getEmployeeName(
                              record.employeeId
                            )}
                          </strong>

                          <span>
                            {getEmployeeCode(
                              record.employeeId
                            )}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>
                      {formatDate(
                        record.overtimeDate
                      )}
                    </td>

                    <td>
                      <strong>
                        {Number(
                          record.hours || 0
                        ).toFixed(1)}
                      </strong>{" "}
                      hrs
                    </td>

                    <td>
                      {formatMoney(
                        record.ratePerHour
                      )}
                    </td>

                    <td>
                      <strong>
                        {formatMoney(
                          record.amount
                        )}
                      </strong>
                    </td>

                    <td className="notes-cell">
                      {record.notes || "—"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ADD OVERTIME MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={closeModal}
        >

          <div
            className="modal-card overtime-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="modal-header">

              <div>

                <p className="page-eyebrow">
                  EXTRA HOURS
                </p>

                <h2>
                  Add Overtime
                </h2>

                <p>
                  Record additional working hours for an employee.
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

            {/* FORM */}
            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                {/* EMPLOYEE */}
                <div className="form-group">

                  <label htmlFor="overtime-employeeId">
                    Employee *
                  </label>

                  <select
                    id="overtime-employeeId"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  >

                    <option value="">
                      Select employee
                    </option>

                    {activeEmployees.map(
                      (employee) => (
                        <option
                          key={employee.employeeId}
                          value={employee.employeeId}
                        >
                          {employee.firstName}{" "}
                          {employee.lastName || ""}{" "}
                          ({employee.employeeCode})
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* DATE */}
                <div className="form-group">

                  <label htmlFor="overtimeDate">
                    Overtime Date *
                  </label>

                  <input
                    id="overtimeDate"
                    name="overtimeDate"
                    type="date"
                    value={form.overtimeDate}
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />

                </div>

                {/* HOURS */}
                <div className="form-group">

                  <label htmlFor="hours">
                    Hours *
                  </label>

                  <input
                    id="hours"
                    name="hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="e.g. 2"
                    value={form.hours}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />

                </div>

                {/* RATE */}
                <div className="form-group">

                  <label htmlFor="ratePerHour">
                    Rate Per Hour *
                  </label>

                  <input
                    id="ratePerHour"
                    name="ratePerHour"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 100"
                    value={form.ratePerHour}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />

                </div>

                {/* NOTES */}
                <div className="form-group full-width">

                  <label htmlFor="notes">
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    placeholder="Optional note..."
                    value={form.notes}
                    onChange={handleChange}
                    disabled={saving}
                  />

                </div>

              </div>

              {/* FOOTER */}
              <div className="modal-footer">

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
                  disabled={
                    saving ||
                    !form.employeeId ||
                    !form.hours ||
                    !form.ratePerHour
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Overtime"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Overtime;