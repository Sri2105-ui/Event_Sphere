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

const MainApp = () => {
  const { user, isAuthenticated } = useAuth();
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
          {currentTab === 'organizer-dashboard' && (
            <OrganizerDashboard
              setTab={handleSetTab}
              onSelectEvent={handleSelectEvent}
              onOpenScanner={() => setShowScannerModal(true)}
              onManageAttendees={handleManageAttendees}
            />
          )}

          {currentTab === 'organizer-create-event' && (
            <CreateEditEvent editEvent={editEventData} setTab={handleSetTab} />
          )}

          {currentTab === 'organizer-attendees' && activeEvent && (
            <EventAttendees
              event={activeEvent}
              onBack={() => setCurrentTab('organizer-dashboard')}
              onOpenScanner={() => setShowScannerModal(true)}
            />
          )}

          {currentTab === 'organizer-scanner' && (
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

          {currentTab === 'organizer-analytics' && (
            <OrganizerAnalytics setTab={handleSetTab} />
          )}

          {currentTab === 'organizer-notifications' && <NotificationsPage />}

          {/* Admin Routes */}
          {currentTab === 'admin-dashboard' && (
            <AdminDashboard
              setTab={handleSetTab}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {currentTab === 'admin-approvals' && <EventApprovals setTab={handleSetTab} />}

          {currentTab === 'admin-users' && <AdminUsers setTab={handleSetTab} />}
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
