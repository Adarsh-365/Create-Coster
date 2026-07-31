import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';

import WorkspaceView from './components/WorkspaceView';
import StatusView from './components/StatusView';
import CompletedView from './components/CompletedView';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen font-sans flex flex-col transition-colors duration-200">
            <Navbar />

            <div className="flex-1 flex flex-col">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingView />} />
                <Route path="/login" element={<LoginView />} />
                <Route path="/signup" element={<SignupView />} />

                {/* Protected Routes */}

                <Route
                  path="/workspace"
                  element={
                    <ProtectedRoute>
                      <WorkspaceView />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/status"
                  element={
                    <ProtectedRoute>
                      <StatusView />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/completed"
                  element={
                    <ProtectedRoute>
                      <CompletedView />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
