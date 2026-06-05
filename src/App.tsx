import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { TdrProvider } from './context/TDRContext'
import { TdrApplicationsProvider } from './context/TdrApplicationsContext'

// Auth
import SignUp from './pages/AuthPages/SignUp'
import SignIn from './pages/AuthPages/SignIn'
import ForgotPassword from './pages/AuthPages/ForgetPassword'
import Profile from './pages/Profile/Profile'
import Settings from './pages/Settings/Settings'

// Dashboard
import {
  ApplyTdrPage,
  ApplicationHistoryPage,
  ApplicationTransactionsPage,
  AuditLogsPage,
  BlockchainApiReferencePage,
  CertificatesRoutesLayout,
  DashboardPage,
  DashboardMetricDetailPage,
  DashboardSectionPortalPage,
  PurchaseNotificationPage,
  SaleNotificationPage,
  TamperedDataPage,
  TamperedDataHistoryPage,
  TdrApplicationDetailPage,
  TransferPage,
  UtilizationPage,
  VerificationPage,
  DashboardLayout,
  TotalHistoryTreePage,
} from './modules/dashboard'

const CertificatesPage = lazy(() => import('./modules/dashboard/pages/CertificatesPage'))
const CertificateLedgerPage = lazy(() => import('./modules/dashboard/pages/CertificateLedgerPage'))
const DrcCertificateViewPage = lazy(() => import('./modules/dashboard/pages/DrcCertificateViewPage'))
const DrcHistoryEventDetailPage = lazy(() => import('./modules/dashboard/pages/DrcHistoryEventDetailPage'))
const DrcHistoryTreePage = lazy(() => import('./modules/dashboard/pages/DrcHistoryTreePage'))
const DrcByIdPage = lazy(() => import('./modules/dashboard/pages/DrcByIdPage'))


function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <TdrProvider>
      <TdrApplicationsProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="metrics/:metricSlug" element={<DashboardMetricDetailPage />} />
            <Route path="apply/:applicationId" element={<TdrApplicationDetailPage />} />
            <Route path="apply/:applicationId/history" element={<ApplicationHistoryPage />} />
            <Route path="apply/:applicationId/transactions" element={<ApplicationTransactionsPage />} />
            <Route path="apply/:applicationId/total-history" element={<TotalHistoryTreePage />} />
            <Route path="apply" element={<ApplyTdrPage />} />
            <Route path="certificates" element={<CertificatesRoutesLayout />}>
              <Route index element={<CertificatesPage />} />
              <Route path="drc/:drcId/history" element={<DrcHistoryTreePage />} />
              <Route path="drc/:drcId" element={<DrcByIdPage />} />
              <Route path="history-event/:rowId" element={<DrcHistoryEventDetailPage />} />

              <Route path="drc-view/by-application/:applicationId" element={<DrcCertificateViewPage />} />
              <Route path="drc-view/sno/:sno" element={<DrcCertificateViewPage />} />
              <Route path="by-application/:applicationId" element={<CertificateLedgerPage />} />
              <Route path=":sno" element={<CertificateLedgerPage />} />
            </Route>
            <Route path="transfer" element={<TransferPage />} />
            <Route path="utilization" element={<UtilizationPage />} />
            <Route path="purchase-notifications" element={<PurchaseNotificationPage />} />
            <Route path="sale-notifications" element={<SaleNotificationPage />} />
            <Route path="verification" element={<VerificationPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="blockchain-api-reference" element={<BlockchainApiReferencePage />} />
            <Route path="land-property" element={<DashboardSectionPortalPage />} />
            <Route path="owners" element={<DashboardSectionPortalPage />} />
            <Route path="tampered-data" element={<TamperedDataPage />} />
            <Route path="tampered-data/:recordId/history" element={<TamperedDataHistoryPage />} />
            <Route path="blockchain-records" element={<DashboardSectionPortalPage />} />
            <Route path="transactions" element={<DashboardSectionPortalPage />} />
            <Route path="smart-contracts" element={<DashboardSectionPortalPage />} />
            <Route path="channels" element={<DashboardSectionPortalPage />} />
            <Route path="peers" element={<DashboardSectionPortalPage />} />
            <Route path="analytics" element={<DashboardSectionPortalPage />} />
            <Route path="reports" element={<DashboardSectionPortalPage />} />
            <Route path="users-roles" element={<DashboardSectionPortalPage />} />
            <Route path="departments" element={<DashboardSectionPortalPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="site-settings" element={<Settings />} />
          </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={2500} newestOnTop />
        </BrowserRouter>
      </TdrApplicationsProvider>
    </TdrProvider>
    </QueryClientProvider>
  )
}

export default App