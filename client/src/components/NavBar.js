import {useAuth} from '../hooks/useAuth'

const NavBar = () => {
  const auth = useAuth()
  const {user, logout} = auth

  async function handleLogoutClick() {
    await logout()
  }

  return (
    <nav
      className='navbar is-light'
      role='navigation'
      aria-label='main navigation'
    >
      <div className='navbar-brand'>
        <a className='navbar-item' href='/'>
          <h2 className='title is-4'>Technician Route Map</h2>
        </a>
      </div>
      <div className='navbar-menu is-active'>
        <div className='navbar-end'>
          <div className='navbar-item'>
            {user && (
              <div className='level'>
                <div className='level-item'>
                  <span className='mr-4'>Logged in as: {user.email}</span>
                </div>
                <div className='level-item'>
                  <button
                    className='button is-small'
                    onClick={handleLogoutClick}
                  >
                    <strong>Log out</strong>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
