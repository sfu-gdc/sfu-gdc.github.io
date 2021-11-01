import * as React from "react"
import Layout from "../components/Layout"

const CalendarPage = () => {
  return (
    <Layout at="calendar">
      <h1>About gamedev club</h1>
      <p>something about the club</p>
      <iframe
        src="https://calendar.google.com/calendar/embed?src=sfugamedevclub%40gmail.com&ctz=America%2FVancouver"
        // style={"border: 0"}
        width="800"
        height="600"
        frameborder="0"
        scrolling="no"
      ></iframe>
    </Layout>
  )
}

export default CalendarPage
