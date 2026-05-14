import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has password set (unless we are on the create-password page OR accept-offer-letter page)
    if (!user.hasPassword && location.pathname !== '/create-password' && location.pathname !== '/accept-offer-letter') {
        return <Navigate to="/create-password" replace />;
    }

    // If user has password but tries to access create-password page, redirect to appropriate dashboard
    if (user.hasPassword && location.pathname === '/create-password') {
        // Check if employee has pending offer letter
        if (user.role === 'employee' && user.offerLetterPath && !user.offerLetterAccepted) {
            return <Navigate to="/accept-offer-letter" replace />;
        }

        const userRole = (user.role || '').toLowerCase();
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (userRole === 'employer') {
            return <Navigate to="/company/dashboard" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Check if employee has pending offer letter (only if password is set and not on acceptance page)
    if (
        user.role === 'employee' &&
        user.hasPassword &&
        user.offerLetterPath &&
        !user.offerLetterAccepted &&
        location.pathname !== '/accept-offer-letter'
    ) {
        return <Navigate to="/accept-offer-letter" replace />;
    }

    // If employee has accepted offer letter or no offer letter, don't allow access to acceptance page
    if (
        user.role === 'employee' &&
        location.pathname === '/accept-offer-letter' &&
        (!user.offerLetterPath || user.offerLetterAccepted)
    ) {
        return <Navigate to="/dashboard" replace />;
    }

    // Redirect to appropriate dashboard if accessing root dashboard route
    if (location.pathname === '/dashboard' && user.role === 'employer') {
        return <Navigate to="/company/dashboard" replace />;
    }

    if (location.pathname === '/company/dashboard' && user.role === 'employee') {
        return <Navigate to="/dashboard" replace />;
    }

    // Role-based access control
    if (requiredRole) {
        const userRole = (user.role || '').toLowerCase();
        const required = requiredRole.toLowerCase();

        if (userRole !== required) {
            // Redirect to appropriate dashboard based on role
            if (userRole === 'admin') {
                return <Navigate to="/admin" replace />;
            } else if (userRole === 'employer') {
                return <Navigate to="/company/dashboard" replace />;
            } else {
                return <Navigate to="/dashboard" replace />;
            }
        }
    }

    return children;
};

export default ProtectedRoute;
