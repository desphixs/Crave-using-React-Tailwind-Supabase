import { isSupabaseConfigured } from './lib/supabase';
import StaticApp from './static/StaticApp';
import { Toaster } from 'sonner';

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import AddRecipePage from "./pages/AddRecipePage";
import EditRecipePage from "./pages/EditRecipePage";
import RecipeBoxPage from "./pages/RecipeBoxPage";


/**
 * RealApp: This is the production version of Crave.
 * It uses React Router, real Authentication Context, and connects to your live Supabase database.
 */
const RealApp = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-600/30">
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

/**
 * App: The master controller.
 * It detects if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in your .env file.
 * - If they are: You get the RealApp.
 * - If they are missing: You get the StaticApp (Demo Mode).
 */
const App = () => {
  return (
    <>
      <Toaster position="bottom-right" richColors theme="dark" />
      {isSupabaseConfigured ? <RealApp /> : <StaticApp />}
    </>
  );
};

export default App;