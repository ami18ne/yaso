
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NavigationRail from "@/components/layout/NavigationRail";
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
import CommunitiesPage from "@/pages/Communities"; // Renamed for clarity
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
import LegalPage from "@/pages/Legal";
import ContactPage from "@/pages/Contact";
import FAQPage from "@/pages/FAQ";
import AboutPage from "@/pages/About";
import { ThemeProvider } from "@/contexts/ThemeContext";

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  const publicPaths = ['/auth', '/forgot-password', '/verify-otp', '/reset-password', '/legal', '/contact', '/faq', '/about'];
  if (process.env.NODE_ENV !== 'production') {
    publicPaths.push('/__e2e__')
  }
  const isPublicPath = publicPaths.includes(location);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1D21]">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  if (!user && !isPublicPath) {
    return <Auth />;
  }

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/verify-otp" component={VerifyOTP} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/legal" component={LegalPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/" component={CommunitiesPage} />
      <Route path="/home" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/create" component={Create} />
      <Route path="/create-video" component={CreateVideo} />
      <Route path="/videos" component={Videos} />
      <Route path="/messages" component={Messages} />
      <Route path="/communities" component={CommunitiesPage} />
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
  const [location] = useLocation();

  const isCommunitiesPage = location.startsWith('/communities') || location === '/';

  return (
    <div className="flex h-screen w-full bg-[#24272B]">
      {user && (isCommunitiesPage ? <NavigationRail /> : <Sidebar />)}
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 overflow-y-auto">
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
        <ThemeProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
            <Toaster />
          </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
