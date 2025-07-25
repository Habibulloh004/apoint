import React from "react";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./components/LoginPage";
import MaterialsTable from "./components/MaterialsTable";
import "./App.css";

function App() {
  const { isAuthenticated, token, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return <MaterialsTable token={token} onLogout={logout} />;
}

export default App;
