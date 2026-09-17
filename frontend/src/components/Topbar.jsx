function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <p className="eyebrow">OTAKU HEAVEN</p>
        <span>Payroll Management</span>
      </div>

      <div className="topbar-right">
        <div className="month-badge">
          <span className="month-dot"></span>
          September 2026
        </div>

        <button className="notification-button" type="button">
          ♡
        </button>

        <div className="profile">
          <div className="profile-avatar">D</div>

          <div className="profile-info">
            <strong>Dhruv</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar