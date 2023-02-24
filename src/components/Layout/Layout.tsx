import React from 'react'
import Navbar from '../Navbar'

const Layout = (props: any) => {
  return (
    <>
      {/* Navbar */}
      <Navbar />
      <main>{props.children}</main>
    </>
  )
}
export default Layout
