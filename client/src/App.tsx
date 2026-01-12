import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import Tino from "@/components/Tino";
import BottomNav from "@/components/BottomNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Create from "@/pages/Create";
import CreateVideo from "@/pages/CreateVideo";
import Videos from "@/pages/Videos";
import Messages from "@/pages/Messages";
import Communities from "@/pages/Communities";
import Notifications from "@/pages/Notifications";
import CommunityPage from "@/components/Community/CommunityPage";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Settings from "@/pages/Settings";
import VerificationRequest from "@/pages/VerificationRequest";
import NearBy from "@/pages/NearBy";
import Auth from "@/pages/Auth";
import VerifyOTP from "@/pages/VerifyOTP";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import E2EHarness from "@/pages/E2EHarness";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  const publicPaths = ['/auth', '/forgot-password', '/verify-otp', '/reset-password'];
  // Allow a dev-only E2E harness route to be reachable without authentication
  if (process.env.NODE_ENV !== 'production') {
    publicPaths.push('/__e2e__')
  }
  const isPublicPath = publicPaths.includes(location);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl neon-text">Loading...</div>
      </div>
    );
  }

  if (!user && !isPublicPath) {
    return <Auth />;
  }

  return (
    <Switch>
      {/* Public routes */}
      {process.env.NODE_ENV !== 'production' && (
        <Route path="/__e2e__" component={E2EHarness} />
      )}
      <Route path="/auth" component={Auth} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/verify-otp" component={VerifyOTP} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Protected routes */}
      <Route path="/" component={Videos} />
      <Route path="/home" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/create" component={Create} />
      <Route path="/create-video" component={CreateVideo} />
      <Route path="/videos" component={Videos} />
      <Route path="/messages" component={Messages} />
      <Route path="/communities" component={Communities} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/profile" component={Profile} />
      <Route path="/edit-profile" component={EditProfile} />
      <Route path="/settings" component={Settings} />
      <Route path="/verify" component={VerificationRequest} />
      <Route path="/nearby" component={NearBy} />
      <Route path="/communities/:id" component={CommunityPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full bg-background">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 'var(--sidebar-width, 5rem)' }}>
        {user && <TopBar />}
        <main className="flex-1 overflow-hidden">
          <Router />
        </main>
        {user && <BottomNav />}
      </div>
      <Tino />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;

// Buzly Web App
// Owner: YA SO
// Date: 11-12-2025
