import { useState } from 'react'

function Settings() {
  const [business, setBusiness] = useState({
    name: 'Otaku Heaven',
    type: 'Cafe & Restaurant',
    email: '',
    phone: '',
    address: ''
  })

  const [notifications, setNotifications] = useState({
    payrollReminder: true,
    advanceAlert: true,
    attendanceReminder: true,
    systemUpdates: false
  })

  const [payrollPreferences, setPayrollPreferences] = useState({
    defaultWorkingDays: '30',
    currency: 'INR',
    autoCalculateOvertime: true,
    autoCalculateBonus: true
  })

  const [saved, setSaved] = useState(false)

  function handleBusinessChange(event) {
    const { name, value } = event.target

    setBusiness(previous => ({
      ...previous,
      [name]: value
    }))

    setSaved(false)
  }

  function handleNotificationChange(event) {
    const { name, checked } = event.target

    setNotifications(previous => ({
      ...previous,
      [name]: checked
    }))

    setSaved(false)
  }

  function handlePayrollChange(event) {
    const { name, value, type, checked } = event.target

    setPayrollPreferences(previous => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }))

    setSaved(false)
  }

  function handleSave(event) {
    event.preventDefault()

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 3000)
  }

  return (
    <div className="page settings-page">

      {/* HEADER */}

      <div className="page-heading">

        <div>
          <p className="page-eyebrow">
            SYSTEM CONFIGURATION
          </p>

          <h1>Settings</h1>

          <p>
            Manage your business information and PayFlow preferences.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() =>
            document
              .getElementById('settings-form')
              ?.requestSubmit()
          }
        >
          Save Changes
        </button>

      </div>


      {/* SUCCESS MESSAGE */}

      {saved && (
        <div className="success-banner">
          ✓ Settings saved successfully.
        </div>
      )}


      <form
        id="settings-form"
        onSubmit={handleSave}
      >

        {/* BUSINESS INFORMATION */}

        <div className="dashboard-card settings-card">

          <div className="settings-card-header">

            <div className="settings-icon lavender-icon">
              🏪
            </div>

            <div>
              <h2>
                Business Information
              </h2>

              <p>
                Basic information about your business.
              </p>
            </div>

          </div>


          <div className="form-grid">

            <div className="form-group">

              <label>
                Business Name
              </label>

              <input
                type="text"
                name="name"
                value={business.name}
                onChange={handleBusinessChange}
                placeholder="Business name"
              />

            </div>


            <div className="form-group">

              <label>
                Business Type
              </label>

              <input
                type="text"
                name="type"
                value={business.type}
                onChange={handleBusinessChange}
                placeholder="Business type"
              />

            </div>


            <div className="form-group">

              <label>
                Business Email
              </label>

              <input
                type="email"
                name="email"
                value={business.email}
                onChange={handleBusinessChange}
                placeholder="business@example.com"
              />

            </div>


            <div className="form-group">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={business.phone}
                onChange={handleBusinessChange}
                placeholder="Business phone number"
              />

            </div>


            <div className="form-group full-width">

              <label>
                Business Address
              </label>

              <textarea
                name="address"
                value={business.address}
                onChange={handleBusinessChange}
                placeholder="Business address"
                rows="3"
              />

            </div>

          </div>

        </div>


        {/* ACCOUNT */}

        <div className="dashboard-card settings-card">

          <div className="settings-card-header">

            <div className="settings-icon peach-icon">
              👤
            </div>

            <div>
              <h2>
                Account
              </h2>

              <p>
                Information about the current PayFlow administrator.
              </p>
            </div>

          </div>


          <div className="account-preview">

            <div className="settings-avatar">
              D
            </div>

            <div className="account-details">

              <strong>
                Dhruv
              </strong>

              <span>
                Administrator
              </span>

              <small>
                Full system access
              </small>

            </div>

            <div className="account-status">
              Active
            </div>

          </div>

        </div>


        {/* NOTIFICATIONS */}

        <div className="dashboard-card settings-card">

          <div className="settings-card-header">

            <div className="settings-icon mint-icon">
              🔔
            </div>

            <div>
              <h2>
                Notifications
              </h2>

              <p>
                Choose which reminders and alerts PayFlow should provide.
              </p>
            </div>

          </div>


          <div className="settings-options">

            <label className="setting-option">

              <div>

                <strong>
                  Payroll reminders
                </strong>

                <span>
                  Remind me when monthly payroll needs attention.
                </span>

              </div>

              <input
                type="checkbox"
                name="payrollReminder"
                checked={notifications.payrollReminder}
                onChange={handleNotificationChange}
              />

            </label>


            <label className="setting-option">

              <div>

                <strong>
                  Advance alerts
                </strong>

                <span>
                  Show reminders about pending employee advances.
                </span>

              </div>

              <input
                type="checkbox"
                name="advanceAlert"
                checked={notifications.advanceAlert}
                onChange={handleNotificationChange}
              />

            </label>


            <label className="setting-option">

              <div>

                <strong>
                  Attendance reminders
                </strong>

                <span>
                  Remind administrators to keep attendance updated.
                </span>

              </div>

              <input
                type="checkbox"
                name="attendanceReminder"
                checked={notifications.attendanceReminder}
                onChange={handleNotificationChange}
              />

            </label>


            <label className="setting-option">

              <div>

                <strong>
                  System updates
                </strong>

                <span>
                  Receive information about PayFlow updates.
                </span>

              </div>

              <input
                type="checkbox"
                name="systemUpdates"
                checked={notifications.systemUpdates}
                onChange={handleNotificationChange}
              />

            </label>

          </div>

        </div>


        {/* PAYROLL PREFERENCES */}

        <div className="dashboard-card settings-card">

          <div className="settings-card-header">

            <div className="settings-icon sky-icon">
              💰
            </div>

            <div>
              <h2>
                Payroll Preferences
              </h2>

              <p>
                Configure default payroll calculation preferences.
              </p>
            </div>

          </div>


          <div className="form-grid">

            <div className="form-group">

              <label>
                Default Working Days
              </label>

              <input
                type="number"
                name="defaultWorkingDays"
                min="1"
                max="31"
                value={
                  payrollPreferences.defaultWorkingDays
                }
                onChange={handlePayrollChange}
              />

            </div>


            <div className="form-group">

              <label>
                Currency
              </label>

              <select
                name="currency"
                value={payrollPreferences.currency}
                onChange={handlePayrollChange}
              >

                <option value="INR">
                  INR — Indian Rupee (₹)
                </option>

                <option value="USD">
                  USD — US Dollar ($)
                </option>

              </select>

            </div>

          </div>


          <div className="settings-options payroll-options">

            <label className="setting-option">

              <div>

                <strong>
                  Automatic overtime calculation
                </strong>

                <span>
                  Include calculated overtime amounts in payroll.
                </span>

              </div>

              <input
                type="checkbox"
                name="autoCalculateOvertime"
                checked={
                  payrollPreferences.autoCalculateOvertime
                }
                onChange={handlePayrollChange}
              />

            </label>


            <label className="setting-option">

              <div>

                <strong>
                  Automatic bonus calculation
                </strong>

                <span>
                  Include eligible bonuses when payroll is generated.
                </span>

              </div>

              <input
                type="checkbox"
                name="autoCalculateBonus"
                checked={
                  payrollPreferences.autoCalculateBonus
                }
                onChange={handlePayrollChange}
              />

            </label>

          </div>

        </div>


        {/* SYSTEM INFORMATION */}

        <div className="dashboard-card settings-card">

          <div className="settings-card-header">

            <div className="settings-icon purple-icon">
              ⚙
            </div>

            <div>
              <h2>
                System Information
              </h2>

              <p>
                Current PayFlow application configuration.
              </p>
            </div>

          </div>


          <div className="system-info-grid">

            <div>
              <span>
                Application
              </span>

              <strong>
                PayFlow
              </strong>
            </div>


            <div>
              <span>
                Version
              </span>

              <strong>
                1.0.0
              </strong>
            </div>


            <div>
              <span>
                Backend
              </span>

              <strong>
                Spring Boot
              </strong>
            </div>


            <div>
              <span>
                Database
              </span>

              <strong>
                MySQL
              </strong>
            </div>


            <div>
              <span>
                Frontend
              </span>

              <strong>
                React + Vite
              </strong>
            </div>


            <div>
              <span>
                Environment
              </span>

              <strong>
                Local Development
              </strong>
            </div>

          </div>

        </div>


        {/* DANGER ZONE */}

        <div className="dashboard-card settings-card danger-card">

          <div className="settings-card-header">

            <div className="settings-icon danger-icon">
              ⚠
            </div>

            <div>

              <h2>
                Danger Zone
              </h2>

              <p>
                Actions that may affect your business data.
              </p>

            </div>

          </div>


          <div className="danger-content">

            <div>

              <strong>
                Data management
              </strong>

              <span>
                Payroll, attendance and employee records are
                stored in your MySQL database.
              </span>

            </div>

            <span className="danger-note">
              Database actions should be performed carefully.
            </span>

          </div>

        </div>


        {/* BOTTOM SAVE */}

        <div className="settings-save-bar">

          <div>

            <strong>
              Changes are stored locally
            </strong>

            <span>
              These preferences currently apply to this session.
            </span>

          </div>

          <button
            className="primary-button"
            type="submit"
          >
            Save Changes
          </button>

        </div>

      </form>

    </div>
  )
}

export default Settings