import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // 기본 스타일링을 위해 CSS 파일을 import 할 수 있습니다.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// import { Routes, Route, Link } from "react-router-dom";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import NotFound from "./pages/NotFound";

// function App() {
//   return (
//     <>
//       <nav style={{ padding: "1rem", background: "#eee" }}>
//         <Link to="/">🏠 홈</Link>
//         <Link to="/login">🔐 로그인</Link>
//         <Link to="/study">📚 스터디 목록</Link>
//       </nav>

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </>
//   );
// }

export default App;
