/*
Notes:
pageName property should be enum if we move to typescript
*/

import * as React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import "../style/reset.css"

const Container = styled.main`
  max-width: 1000px;
  margin: 50px auto;
  padding: 10px;
`

const Nav = styled.nav`
  background-color: #333;
  overflow: hidden;
`

const NavItem = styled(Link)`
  float: left;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
  background-color: ${({ toName, atName }) =>
    toName === atName ? "rgba(255, 255, 255, 0.1)" : "inherit"};

  :hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

const Layout = ({ at, children }) => {
  return (
    <>
      <title>{at}</title>
      <Nav>
        <NavItem to="/" toName="home" atName={at}>
          Home
        </NavItem>
        <NavItem to="/about" toName="about" atName={at}>
          About
        </NavItem>
        <NavItem to="/calendar" toName="calendar" atName={at}>
          Calendar
        </NavItem>
      </Nav>
      <Container>{children}</Container>
    </>
  )
}
export default Layout
