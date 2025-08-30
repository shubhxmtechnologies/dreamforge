import React, { useEffect, useState } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import { useAuth } from './utils/AuthContext'

const App = () => {

  const { loading, user, fetchUser, setUser } = useAuth()
  useEffect(() => {
    fetchUser()

  }, [setUser])

  if (loading) {
    return <>
      <div className='flex h-screen w-screen items-center justify-center'>

        <div className="spinner">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

    </>
  }

  if (!user) {
    return (
      <LandingPage />
    )
  } else {
    return (
      <Dashboard />
    )
  }

}

export default App