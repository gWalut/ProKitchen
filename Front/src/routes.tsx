import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

import { HelloPage } from '@/features/auth/pages/HelloPage';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const MainPage = lazy(() => import('@/mainPage/MainPage'));
const CalcPage = lazy(() => import('@/features/calculator/pages/CalcPage'));
const AllergensPage = lazy(() => import('@/features/allergens/pages/AllergensPage'));
const LabelsPage = lazy(() => import('@/features/labels/pages/LabelsPage'));
const FavoritesPage = lazy(() => import('@/features/dishes/pages/FavoritesPage'));
const DishDetailPage = lazy(() => import('@/features/dishes/pages/DishDetailPage'));
const EditCustomDishPage = lazy(() => import('@/features/dishes/pages/EditCustomDishPage'));
const SettingsPage = lazy(() => import('@/features/profile/pages/SettingsPage'));
const PrivacyPolicyPage = lazy(() => import('@/PrivPolis/PrivacyPolicyPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage'));

// Компонент загрузки для Suspense
const PageLoader = () => (
    <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
    </div>
);

export const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<HelloPage />} />
                <Route path="/hello" element={<HelloPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/calc" element={<CalcPage />} />
                <Route path="/allergens" element={<AllergensPage />} />

                {/* Protected Routes - требуют авторизации */}
                <Route path="/labels" element={
                    <ProtectedRoute>
                        <LabelsPage />
                    </ProtectedRoute>
                } />
                <Route path="/favorites" element={
                    <ProtectedRoute>
                        <FavoritesPage />
                    </ProtectedRoute>
                } />
                <Route path="/dishes/:id" element={<DishDetailPage />} />
                <Route path="/custom-dishes/:id" element={<EditCustomDishPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />

                {/* Admin Routes */}
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute requiredRoles={['admin']}>
                            <AdminUsersPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};