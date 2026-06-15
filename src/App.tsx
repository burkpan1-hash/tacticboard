import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import EditorPage from './pages/EditorPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SharePage from './pages/SharePage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import PricingPage from './pages/PricingPage'
import RefundPage from './pages/RefundPage'
import GuidesPage from './pages/GuidesPage'
import GuideArticlePage from './pages/GuideArticlePage'
import NotFoundPage from './pages/NotFoundPage'
import CookieConsentBanner from './components/ui/CookieConsentBanner'
import { GUIDES_ENABLED } from './config/features'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/editor/:setId" element={<EditorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/refund" element={<RefundPage />} />
        {GUIDES_ENABLED && (
          <>
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/guides/:slug" element={<GuideArticlePage />} />
          </>
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CookieConsentBanner />
    </>
  )
}
