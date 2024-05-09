import React from 'react'
import logo from '../images/logo.png'

function Header() {
  return (
    <div className='header'>
      <img src={logo} />
      <i className="bi bi-list iconMenu"></i>
    </div>
  )
}

export default Header
