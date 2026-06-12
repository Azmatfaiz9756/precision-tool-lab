import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layout
import Layout from '@/components/layout/Layout';

// Admin
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminNewsletter from '@/pages/admin/AdminNewsletter';
import AdminSettings from '@/pages/admin/AdminSettings';

// Pages
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Account from '@/pages/Account';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import Shipping from '@/pages/Shipping';
import Returns from '@/pages/Returns';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Cookie from '@/pages/Cookie';
import Trademark from '@/pages/Trademark';
import PaymentMethods from '@/pages/PaymentMethods';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookie" element={<Cookie />} />
        <Route path="/trademark" element={<Trademark />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

import AntiScrape from '@/components/AntiScrape';
import { useEffect } from 'react';
import { apiClient } from '@/api/apiClient';

function useSEO() {
  useEffect(() => {
    apiClient.settings.get().then(settings => {
      // Save live API settings to localStorage so useSettings hook can use them
      if (Object.keys(settings).length > 0) {
        localStorage.setItem("tsttools_settings", JSON.stringify(settings));
        window.dispatchEvent(new Event("local-settings-updated"));
      }

      if (settings.meta_title) {
        document.title = settings.meta_title;
      } else if (settings.store_name) {
        document.title = settings.store_name;
      }

      if (settings.meta_description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = "description";
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = settings.meta_description;
      }

      if (settings.meta_keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = "keywords";
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = settings.meta_keywords;
      }
    }).catch(console.error);

    const handleUpdate = () => {
      // Reload on local settings update
      apiClient.settings.get().then(settings => {
        if (settings.meta_title) document.title = settings.meta_title;
        else if (settings.store_name) document.title = settings.store_name;

        if (settings.meta_description) {
          const m = document.querySelector('meta[name="description"]');
          if (m) m.content = settings.meta_description;
        }
        if (settings.meta_keywords) {
          const m = document.querySelector('meta[name="keywords"]');
          if (m) m.content = settings.meta_keywords;
        }
      });
    };
    window.addEventListener("local-settings-updated", handleUpdate);
    return () => window.removeEventListener("local-settings-updated", handleUpdate);
  }, []);
}

function App() {
  useSEO();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AntiScrape />
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App