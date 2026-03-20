// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'
// import Login from './components/Login'
// import Rev from './components/rev-ai/Rev'
// import MeetingFeed from './components/meeting-feed/MeetingFeed'

import AppRoutes from "./routes/AppRoutes"

function App() {
  return (
    <>
      <AppRoutes />
    </>
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<Login />} />
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/rev" element={<Rev />} />
    //     <Route path="/meeting-feed" element={<MeetingFeed />} />
    //     <Route path="*" element={<Navigate to="/" replace />} />
    //   </Routes>
    // </Router>
  )
}

export default App
