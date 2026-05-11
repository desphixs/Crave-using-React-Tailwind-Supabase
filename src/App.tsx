import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import RecipeBoxPage from './pages/RecipeBoxPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-white">
        <Navbar />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/login" element={<AuthPage />} />
          
          {/* Dashboard Routes (Protected) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="add" element={<AddRecipePage />} />
            <Route path="edit/:id" element={<EditRecipePage />} />
          </Route>
          
          {/* Saved Recipes (Protected) */}
          <Route 
            path="/recipe-box" 
            element={
              <ProtectedRoute>
                <RecipeBoxPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;