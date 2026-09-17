import { useNavigate } from 'react-router-dom'
function Dashboard() {
    const navigate = useNavigate()
  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Good morning 👋</h1>
          <p>Here’s what’s happening with your business today.</p>
        </div>

        <button
  className="primary-button"
  onClick={() => navigate('/employees')}
>
  + Add Employee
</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card lavender">
          <span className="stat-label">Total Employees</span>
          <h2>5</h2>
          <p>Active employees</p>
        </div>

        <div className="stat-card peach">
          <span className="stat-label">This Month Payroll</span>
          <h2>₹16,760</h2>
          <p>September 2026</p>
        </div>

        <div className="stat-card mint">
          <span className="stat-label">Attendance</span>
          <h2>87%</h2>
          <p>Average this month</p>
        </div>

        <div className="stat-card sky">
          <span className="stat-label">Pending Advances</span>
          <h2>₹7,000</h2>
          <p>2 pending requests</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>Payroll Overview</h3>
              <p>Monthly salary distribution</p>
            </div>

            <button className="view-button">View payroll</button>
          </div>

          <div className="payroll-summary">
            <div>
              <span>Total payroll</span>
              <strong>₹1,28,450</strong>
            </div>

            <div>
              <span>Employees paid</span>
              <strong>4 / 5</strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>₹20,000</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>Quick Actions</h3>
              <p>Common things you can do</p>
            </div>
          </div>

          <div className="quick-actions">
            <button>👤 Add Employee</button>
            <button>📅 Mark Attendance</button>
            <button>💰 Add Advance</button>
            <button>✨ Add Bonus</button>
          </div>
        </div>
      </div>

      <div className="dashboard-card recent-card">
        <div className="card-heading">
          <div>
            <h3>Recent Activity</h3>
            <p>Latest updates from PayFlow</p>
          </div>

          <button className="view-button">View all</button>
        </div>

        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon lavender-icon">👤</div>
            <div>
              <strong>New employee added</strong>
              <p>Employee #EMP005 was added to Otaku Heaven</p>
            </div>
            <span>Today</span>
          </div>

          <div className="activity-item">
            <div className="activity-icon mint-icon">✓</div>
            <div>
              <strong>Payroll finalized</strong>
              <p>September 2026 payroll was finalized</p>
            </div>
            <span>Yesterday</span>
          </div>

          <div className="activity-item">
            <div className="activity-icon peach-icon">₹</div>
            <div>
              <strong>Advance recorded</strong>
              <p>₹5,000 advance added for Tanjiro Kamado</p>
            </div>
            <span>2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard