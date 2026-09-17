import { useNavigate } from 'react-router-dom'
import { getUser, logout } from '../services/auth'

function Topbar() {
  const navigate = useNavigate()
  const user = getUser()

  const username = user?.username || 'User'
  const role = user?.role || 'USER'

  const profileLetter = username.charAt(0).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">

      <div className="topbar-left">
        <p className="eyebrow">
          OTAKU HEAVEN
        </p>

        <span>
          Payroll Management
        </span>
      </div>


      <div className="topbar-right">

        <div className="month-badge">
          <span className="month-dot"></span>
          September 2026
        </div>


        <button
          className="notification-button"
          type="button"
        >
          ♡
        </button>


        <div className="profile">

          <div className="profile-avatar">
            {profileLetter}
          </div>

          <div className="profile-info">
            <strong>
              {username}
            </strong>

            <span>
              {role}
            </span>
          </div>

        </div>


        <button
          className="logout-button"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </header>
  )
}

export default Topbar