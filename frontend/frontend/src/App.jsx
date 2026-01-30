import "./styles/global.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Footer from "./components/Footer";
import Team from "./pages/Team";
import Documentation from "./pages/Documentation";
import HelpCenter from "./pages/HelpCenter";
import ApiReference from "./pages/ApiReference";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ContactSupport from "./pages/ContactSupport";
import MyTasks from "./pages/MyTasks";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/boards"
              element={
                <ProtectedRoute>
                  <Board />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <MyTasks />
                </ProtectedRoute>
              }
            />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/api" element={<ApiReference />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <ContactSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
