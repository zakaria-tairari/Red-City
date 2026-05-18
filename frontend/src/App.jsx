import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import MainLayout from "./layouts/MainLayout"

const App = () => {
  return (
    <Routes>
      <Route path="/" element={ <MainLayout /> }>
        <Route index element={<Home />} />

        <Route path="*" element={<Navigate to={"/"} />} />
      </Route>    
    </Routes>
  )
}

export default App