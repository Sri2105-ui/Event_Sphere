import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AttendanceScannerModal } from './components/AttendanceScannerModal';
import api from './services/api';

// Public Pages
import { Home } from './pages/public/Home';
import { ExploreEvents } from './pages/public/ExploreEvents';
import { EventDetails } from './pages/public/EventDetails';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { VerifyCertificate } from './pages/public/VerifyCertificate';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Participant Pages
import { ParticipantDashboard } from './pages/participant/ParticipantDashboard';
import { MyRegistrations } from './pages/participant/MyRegistrations';
import { CertificatesGallery } from './pages/participant/CertificatesGallery';
import { NotificationsPage } from './pages/participant/NotificationsPage';
import { ProfilePage } from './pages/participant/ProfilePage';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { CreateEditEvent } from './pages/organizer/CreateEditEvent';
import { EventAttendees } from './pages/organizer/EventAttendees';
import { OrganizerAnalytics } from './pages/organizer/OrganizerAnalytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EventApprovals } from './pages/admin/EventApprovals';
import { AdminUsers } from './pages/admin/AdminUsers';

const RoleAccessGuard = ({ requiredRole, currentRole, onUpgrade, onSwitchDemo, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
        <span className="material-symbols-outlined text-[36px]">lock</span>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
          Access Restricted
        </span>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          {requiredRole === 'admin' ? 'Administrator Clearance Required' : 'Club Organizer Privileges Required'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          You are currently signed in with role <code className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold font-mono">[{currentRole || 'guest'}]</code>.
          This portal is reserved for {requiredRole === 'admin' ? 'Campus Senate administrators' : 'verified Club Organizers and Event Directors'}.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 max-w-sm mx-auto text-left">
        <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-center mb-1">
          Quick Access Options
        </h4>
        {requiredRole === 'organizer' && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <span>🎪 1-Click Upgrade to Organizer</span>
          </button>
        )}
        <button
          onClick={onSwitchDemo}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Switch to Demo {requiredRole === 'admin' ? 'Admin' : 'Organizer'}</span>
        </button>
        <button
          onClick={onBack}
          className="w-full py-1.5 text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium"
        >
          Return to Student Hub
        </button>
      </div>
    </div>
  );
};

const MainApp = () => {
  const { user, isAuthenticated, switchRole, quickDemoLogin } = useAuth();
  const isOrganizer = user && (user.role === 'organizer' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  const [currentTab, setCurrentTab] = useState('home');
  const [activeEvent, setActiveEvent] = useState(null);
  const [editEventData, setEditEventData] = useState(null);
  const [initialExploreFilters, setInitialExploreFilters] = useState({});
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [organizerEventsList, setOrganizerEventsList] = useState([]);

  // Load events for scanner selector
  useEffect(() => {
    if (user && (user.role === 'organizer' || user.role === 'admin')) {
      api.get('/events/organizer/my-events').then((res) => {
        if (res.data.success) {
          setOrganizerEventsList(res.data.events);
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleSetTab = (tabName, extraData = {}) => {
    if (extraData.editEvent) {
      setEditEventData(extraData.editEvent);
    } else {
      setEditEventData(null);
    }

    if (tabName === 'explore' && (extraData.keyword || extraData.category)) {
      setInitialExploreFilters(extraData);
    }

    setCurrentTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEvent = (evt) => {
    setActiveEvent(evt);
    setCurrentTab('event-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManageAttendees = (evt) => {
    setActiveEvent(evt);
    setCurrentTab('organizer-attendees');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-brand-500 selection:text-white">
      <div>
        <Navbar currentTab={currentTab} setTab={handleSetTab} />

        <main className="transition-all duration-300">
          {/* Public Routes */}
          {currentTab === 'home' && (
            <Home setTab={handleSetTab} onSelectEvent={handleSelectEvent} />
          )}

          {currentTab === 'explore' && (
            <ExploreEvents
              initialFilters={initialExploreFilters}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {currentTab === 'event-details' && activeEvent && (
            <EventDetails
              eventSlugOrId={activeEvent.slug || activeEvent._id}
              onBack={() => setCurrentTab('explore')}
              setTab={handleSetTab}
            />
          )}

          {currentTab === 'categories' && <CategoriesPage setTab={handleSetTab} />}

          {currentTab === 'verify-cert' && <VerifyCertificate />}

          {currentTab === 'login' && <LoginPage setTab={handleSetTab} />}

          {currentTab === 'register' && <RegisterPage setTab={handleSetTab} />}

          {/* Participant Routes */}
          {currentTab === 'participant-dashboard' && (
            <ParticipantDashboard
              setTab={handleSetTab}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {currentTab === 'participant-tickets' && (
            <MyRegistrations onSelectEvent={handleSelectEvent} />
          )}

          {currentTab === 'participant-certificates' && (
            <CertificatesGallery setTab={handleSetTab} />
          )}

          {currentTab === 'participant-notifications' && <NotificationsPage />}

          {currentTab === 'profile' && <ProfilePage />}

          {/* Organizer Routes */}
          {currentTab.startsWith('organizer-') && !isOrganizer && (
            <RoleAccessGuard
              requiredRole="organizer"
              currentRole={user?.role}
              onUpgrade={async () => {
                await switchRole('organizer');
              }}
              onSwitchDemo={() => quickDemoLogin('organizer')}
              onBack={() => handleSetTab('participant-dashboard')}
            />
          )}

          {currentTab === 'organizer-dashboard' && isOrganizer && (
            <OrganizerDashboard
              setTab={handleSetTab}
              onSelectEvent={handleSelectEvent}
              onOpenScanner={() => setShowScannerModal(true)}
              onManageAttendees={handleManageAttendees}
            />
          )}

          {currentTab === 'organizer-create-event' && isOrganizer && (
            <CreateEditEvent editEvent={editEventData} setTab={handleSetTab} />
          )}

          {currentTab === 'organizer-attendees' && isOrganizer && activeEvent && (
            <EventAttendees
              event={activeEvent}
              onBack={() => setCurrentTab('organizer-dashboard')}
              onOpenScanner={() => setShowScannerModal(true)}
            />
          )}

          {currentTab === 'organizer-scanner' && isOrganizer && (
            <div className="py-16 text-center space-y-4">
              <h2 className="text-2xl font-bold">QR Attendance Scanner Active</h2>
              <button
                onClick={() => setShowScannerModal(true)}
                className="px-6 py-3 rounded-xl bg-brand-600 font-bold text-sm shadow-xl"
              >
                Launch Gate Scanner Window
              </button>
            </div>
          )}

          {currentTab === 'organizer-analytics' && isOrganizer && (
            <OrganizerAnalytics setTab={handleSetTab} />
          )}

          {currentTab === 'organizer-notifications' && isOrganizer && <NotificationsPage />}

          {/* Admin Routes */}
          {currentTab.startsWith('admin-') && !isAdmin && (
            <RoleAccessGuard
              requiredRole="admin"
              currentRole={user?.role}
              onSwitchDemo={() => quickDemoLogin('admin')}
              onBack={() => handleSetTab('home')}
            />
          )}

          {currentTab === 'admin-dashboard' && isAdmin && (
            <AdminDashboard
              setTab={handleSetTab}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {currentTab === 'admin-approvals' && isAdmin && <EventApprovals setTab={handleSetTab} />}

          {currentTab === 'admin-users' && isAdmin && <AdminUsers setTab={handleSetTab} />}
        </main>
      </div>

      {/* Global QR Gate Scanner Modal */}
      {showScannerModal && (
        <AttendanceScannerModal
          events={organizerEventsList}
          activeEventId={activeEvent?._id}
          onClose={() => setShowScannerModal(false)}
        />
      )}

      {/* Floating Bottom App Nav on Mobile */}
      <MobileBottomNav
        currentTab={currentTab}
        setTab={handleSetTab}
        onOpenScanner={() => setShowScannerModal(true)}
      />

      <Footer setTab={handleSetTab} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <MainApp />
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
