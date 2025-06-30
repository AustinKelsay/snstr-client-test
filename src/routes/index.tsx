/**
 * @fileoverview Route configuration for the application
 * Implements lazy loading and proper route structure
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load page components
const TimelinePage = React.lazy(() => import('@/pages/Timeline'));
const ProfilePage = React.lazy(() => import('@/pages/Profile'));
const SettingsPage = React.lazy(() => import('@/pages/Settings'));

/**
 * Route wrapper component for lazy-loaded routes
 * Provides loading state while components are being imported
 */
function RouteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

/**
 * Application routes configuration
 * Defines all application routes with lazy loading
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Default route redirect */}
      <Route path="/" element={<Navigate to="/timeline" replace />} />
      
      {/* Main application routes */}
      <Route 
        path="/timeline" 
        element={
          <RouteWrapper>
            <TimelinePage />
          </RouteWrapper>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <RouteWrapper>
            <ProfilePage />
          </RouteWrapper>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <RouteWrapper>
            <SettingsPage />
          </RouteWrapper>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/timeline" replace />} />
    </Routes>
  );
}

export default AppRoutes; 