import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

function Bonuses() {
  const [bonuses, setBonuses] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    bonusType: "PERCENTAGE",
    value: "",
    bonusDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [bonusResponse, employeeResponse] = await Promise.all([
        fetch(`${API_URL}/bonuses`),
        fetch(`${API_URL}/employees`),
      ]);

      if (!bonusResponse.ok) {
        throw new Error("Unable to load bonus records.");
      }

      if (!employeeResponse.ok) {
        throw new Error("Unable to load employees.");
      }

      const bonusData = await bonusResponse.json();
      const employeeData = await employeeResponse.json();

      setBonuses(Array.isArray(bonusData) ? bonusData : []);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load bonuses.");
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

  const percentageBonuses = bonuses.filter(
    (bonus) => bonus.bonusType === "PERCENTAGE"
  );

  const fixedBonuses = bonuses.filter(
    (bonus) => bonus.bonusType === "FIXED"
  );

  const percentageValue = percentageBonuses.reduce(
    (total, bonus) => total + Number(bonus.value || 0),
    0
  );

  const fixedValue = fixedBonuses.reduce(
    (total, bonus) => total + Number(bonus.value || 0),
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

      const response = await fetch(`${API_URL}/bonuses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: Number(form.employeeId),
          bonusType: form.bonusType,
          value: Number(form.value),
          bonusDate: form.bonusDate,
          reason: form.reason || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create bonus."
        );
      }

      setBonuses((previous) => [data, ...previous]);

      setForm({
        employeeId: "",
        bonusType: "PERCENTAGE",
        value: "",
        bonusDate: new Date().toISOString().split("T")[0],
        reason: "",
      });

      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save bonus.");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bonuses-page">

      <div className="bonuses-header">

        <div>
          <div className="bonuses-eyebrow">
            EMPLOYEE REWARDS
          </div>

          <h1>Bonuses</h1>

          <p className="page-subtitle">
            Reward employees with performance, festival and fixed bonuses.
          </p>
        </div>

        <button
          className="primary-button bonuses-button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          + Add Bonus
        </button>

      </div>

      {error && (
        <div className="error-message">
          <span>⚠</span>
          {error}
        </div>
      )}

      <div className="bonuses-summary">

        <div className="bonus-summary-card bonus-yellow">
          <div className="bonus-icon">✨</div>

          <div>
            <span>Total Bonus Records</span>
            <strong>{bonuses.length}</strong>
            <small>Recorded bonuses</small>
          </div>
        </div>

        <div className="bonus-summary-card bonus-lavender">
          <div className="bonus-icon">%</div>

          <div>
            <span>Percentage Bonuses</span>
            <strong>{percentageBonuses.length}</strong>
            <small>
              {percentageValue.toFixed(2)}% combined value
            </small>
          </div>
        </div>

        <div className="bonus-summary-card bonus-peach">
          <div className="bonus-icon">₹</div>

          <div>
            <span>Fixed Bonuses</span>
            <strong>
              {formatCurrency(fixedValue)}
            </strong>
            <small>Fixed-value bonuses</small>
          </div>
        </div>

      </div>

      <div className="bonuses-info">

        <div className="bonuses-info-icon">
          ✨
        </div>

        <div>
          <strong>Payroll calculation</strong>

          <p>
            Percentage bonuses are calculated against the employee's
            earned salary for the payroll month. Fixed bonuses are
            added directly.
          </p>
        </div>

      </div>

      <div className="bonuses-card">

        <div className="bonuses-card-header">

          <div>
            <h2>Bonus Records</h2>

            <p>
              View bonuses assigned to your employees.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadData}
          >
            ↻ Refresh
          </button>

        </div>

        {loading && (
          <div className="page-state">

            <div className="loading-circle"></div>

            <h3>Loading bonuses...</h3>

            <p>
              Please wait while PayFlow loads the records.
            </p>

          </div>
        )}

        {!loading && bonuses.length === 0 && (
          <div className="page-state">

            <div className="empty-icon bonuses-empty-icon">
              ✨
            </div>

            <h3>No bonuses recorded</h3>

            <p>
              Add a bonus to reward an employee.
            </p>

            <button
              className="primary-button bonuses-button"
              onClick={() => setShowModal(true)}
            >
              + Add Bonus
            </button>

          </div>
        )}

        {!loading && bonuses.length > 0 && (
          <div className="table-wrapper">

            <table className="bonuses-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Date</th>
                  <th>Reason</th>
                </tr>
              </thead>

              <tbody>

                {bonuses.map((bonus) => (

                  <tr key={bonus.bonusId}>

                    <td>
                      <div className="bonus-employee">

                        <div className="bonus-avatar">
                          {getEmployeeName(
                            bonus.employeeId
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getEmployeeName(
                              bonus.employeeId
                            )}
                          </strong>

                          <span>
                            {getEmployeeCode(
                              bonus.employeeId
                            )}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>

                      <span
                        className={`bonus-type bonus-type-${(
                          bonus.bonusType || ""
                        ).toLowerCase()}`}
                      >
                        {bonus.bonusType === "PERCENTAGE"
                          ? "%"
                          : "₹"}

                        {bonus.bonusType}
                      </span>

                    </td>

                    <td>

                      <strong className="bonus-value">
                        {bonus.bonusType === "PERCENTAGE"
                          ? `${Number(
                              bonus.value
                            ).toFixed(2)}%`
                          : formatCurrency(
                              bonus.value
                            )}
                      </strong>

                    </td>

                    <td>
                      {bonus.bonusDate}
                    </td>

                    <td>
                      <span className="bonus-reason">
                        {bonus.reason || "—"}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >

          <div className="bonus-modal">

            <div className="modal-header">

              <div>

                <div className="bonuses-eyebrow">
                  EMPLOYEE REWARD
                </div>

                <h2>Add Bonus</h2>

                <p>
                  Add a performance or fixed bonus.
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
                    Bonus Type *
                  </label>

                  <select
                    name="bonusType"
                    value={form.bonusType}
                    onChange={handleChange}
                    required
                  >
                    <option value="PERCENTAGE">
                      Percentage
                    </option>

                    <option value="FIXED">
                      Fixed Amount
                    </option>
                  </select>

                </div>

                <div className="form-group">

                  <label>
                    {form.bonusType === "PERCENTAGE"
                      ? "Percentage *"
                      : "Amount *"}
                  </label>

                  <input
                    type="number"
                    name="value"
                    value={form.value}
                    onChange={handleChange}
                    min="0.01"
                    max={
                      form.bonusType === "PERCENTAGE"
                        ? "100"
                        : undefined
                    }
                    step="0.01"
                    placeholder={
                      form.bonusType === "PERCENTAGE"
                        ? "10"
                        : "2500"
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Bonus Date *
                  </label>

                  <input
                    type="date"
                    name="bonusDate"
                    value={form.bonusDate}
                    onChange={handleChange}
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                  />

                </div>

                <div className="form-group full-width">

                  <label>
                    Reason
                  </label>

                  <input
                    type="text"
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Performance bonus"
                  />

                </div>

              </div>

              <div className="bonuses-form-info">

                <span>ℹ</span>

                <p>
                  Percentage bonuses are calculated by the backend
                  during payroll generation.
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
                  className="primary-button bonuses-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Bonus"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Bonuses;