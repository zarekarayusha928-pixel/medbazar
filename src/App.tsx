import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

// Layouts
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { PharmacyDashboardLayout } from '@/layouts/PharmacyDashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Launcher & Auth Pages
import { PortalLauncherPage } from '@/pages/PortalLauncherPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Customer Pages
import { CustomerDashboardPage } from '@/pages/customer/CustomerDashboardPage';
import { MedicineCatalogPage } from '@/pages/customer/MedicineCatalogPage';
import { MedicineDetailPage } from '@/pages/customer/MedicineDetailPage';
import { PharmacyListPage } from '@/pages/customer/PharmacyListPage';
import { CartPage } from '@/pages/customer/CartPage';
import { CheckoutPage } from '@/pages/customer/CheckoutPage';
import { PrescriptionsPage } from '@/pages/customer/PrescriptionsPage';
import { OrderListPage } from '@/pages/customer/OrderListPage';
import { OrderDetailPage } from '@/pages/customer/OrderDetailPage';
import { ProfilePage } from '@/pages/customer/ProfilePage';

// Pharmacy Pages
import { PharmacyDashboardPage } from '@/pages/pharmacy/PharmacyDashboardPage';
import { PharmacyOrdersPage } from '@/pages/pharmacy/PharmacyOrdersPage';
import { PharmacyPosPage } from '@/pages/pharmacy/PharmacyPosPage';
import { PharmacyInventoryPage } from '@/pages/pharmacy/PharmacyInventoryPage';
import { PharmacyPrescriptionsPage } from '@/pages/pharmacy/PharmacyPrescriptionsPage';
import { PharmacyCustomersPage } from '@/pages/pharmacy/PharmacyCustomersPage';
import { PharmacyPurchasesPage } from '@/pages/pharmacy/PharmacyPurchasesPage';
import { PharmacyDeliveriesPage } from '@/pages/pharmacy/PharmacyDeliveriesPage';
import { PharmacyReportsPage } from '@/pages/pharmacy/PharmacyReportsPage';
import { PharmacyStaffPage } from '@/pages/pharmacy/PharmacyStaffPage';
import { PharmacySettingsPage } from '@/pages/pharmacy/PharmacySettingsPage';

import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminPharmaciesPage } from '@/pages/admin/AdminPharmaciesPage';
import { PharmacyDetailsPage } from '@/pages/admin/PharmacyDetailsPage';
import { AdminBranchesPage } from '@/pages/admin/AdminBranchesPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminMedicinesPage } from '@/pages/admin/AdminMedicinesPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Launcher Entrypoint */}
              <Route path="/" element={<PortalLauncherPage />} />

              {/* Customer Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Customer Routes */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<CustomerDashboardPage />} />
              <Route path="medicines" element={<MedicineCatalogPage />} />
              <Route path="medicines/:id" element={<MedicineDetailPage />} />
              <Route path="pharmacies" element={<PharmacyListPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="prescriptions" element={<PrescriptionsPage />} />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Pharmacy Operational Routes */}
            <Route path="/pharmacy" element={<PharmacyDashboardLayout />}>
              <Route index element={<PharmacyDashboardPage />} />
              <Route path="orders" element={<PharmacyOrdersPage />} />
              <Route path="pos" element={<PharmacyPosPage />} />
              <Route path="inventory" element={<PharmacyInventoryPage />} />
              <Route path="prescriptions" element={<PharmacyPrescriptionsPage />} />
              <Route path="customers" element={<PharmacyCustomersPage />} />
              <Route path="purchases" element={<PharmacyPurchasesPage />} />
              <Route path="deliveries" element={<PharmacyDeliveriesPage />} />
              <Route path="reports" element={<PharmacyReportsPage />} />
              <Route path="staff" element={<PharmacyStaffPage />} />
              <Route path="settings" element={<PharmacySettingsPage />} />
            </Route>

            {/* Admin Platform Control Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="pharmacies" element={<AdminPharmaciesPage />} />
              <Route path="pharmacies/:id" element={<PharmacyDetailsPage />} />
              <Route path="branches" element={<AdminBranchesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="medicines" element={<AdminMedicinesPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </ToastProvider>
);
};

export default App;
