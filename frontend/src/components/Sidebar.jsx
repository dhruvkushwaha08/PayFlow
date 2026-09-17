import { NavLink } from 'react-router-dom'

function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Employees', path: '/employees' },
    { name: 'Attendance', path: '/attendance' },
    { name: 'Advances', path: '/advances' },
    { name: 'Bonuses', path: '/bonuses' },
    { name: 'Overtime', path: '/overtime' },
    { name: 'Payroll', path: '/payroll' },
    { name: 'Salary Slips', path: '/salary-slips' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">P</div>

        <div>
          <h2>PayFlow</h2>
          <span>Salary Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-label">MAIN MENU</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-dot"></span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="nav-dot"></span>
          <span>Settings</span>
        </NavLink>

        <div className="business-card">
          <div className="business-avatar">OH</div>

          <div>
            <strong>Otaku Heaven</strong>
            <span>Cafe & Restaurant</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar