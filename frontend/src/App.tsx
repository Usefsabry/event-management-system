import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { DialogProvider } from './contexts/DialogContext';
import { Button } from './components/ui/Button';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EventsPage } from './pages/Events';
import { EventDetailsPage } from './pages/EventDetails';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { CreateEventPage } from './pages/CreateEvent';
import { AboutPage } from './pages/About';
import { NotFoundPage } from './pages/NotFound';
import { eventsApi, categoriesApi } from './services/api';
import './index.css';

// Navigation Component
const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="px-4 md:px-6">
      <nav className="bg-paper-white shadow-lg rounded-3xl md:rounded-full mt-4 md:mt-5 mx-auto max-w-[1200px] px-6 py-4 relative z-50">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-subheading font-semibold text-warm-graphite">
            EventHub
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="btn-ghost">Events</Link>
            <Link to="/about" className="btn-ghost">About</Link>
            {isAuthenticated && (
              <Link to="/create-event" className="btn-ghost">Create Event</Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
                <span className="text-body text-fog-gray font-medium">{user?.name}</span>
                <button onClick={handleLogout} className="btn-ghost text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register">
                  <Button variant="pill" size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-warm-graphite"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col space-y-2 pt-4 border-t border-gray-100">
            <Link to="/events" className="btn-ghost justify-start" onClick={() => setIsMenuOpen(false)}>Events</Link>
            <Link to="/about" className="btn-ghost justify-start" onClick={() => setIsMenuOpen(false)}>About</Link>
            {isAuthenticated && (
              <Link to="/create-event" className="btn-ghost justify-start" onClick={() => setIsMenuOpen(false)}>Create Event</Link>
            )}

            <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn-ghost justify-start" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <span className="text-body text-fog-gray px-4">{user?.name}</span>
                  <button onClick={handleLogout} className="btn-ghost justify-start text-red-500">Logout</button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 px-4 pb-2">
                  <Link to="/login" className="w-full text-center py-2 text-warm-graphite border rounded-full font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="pill" className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalCategories: 0,
    totalAttendees: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch real statistics from APIs
      const [eventsData, categoriesData] = await Promise.all([
        eventsApi.getAll(),
        categoriesApi.getAll()
      ]);

      const totalEvents = eventsData.events?.length || 0;
      const totalCategories = categoriesData.categories?.length || 0;

      // Calculate total attendees from all events
      const totalAttendees = eventsData.events?.reduce((sum: number, event: any) => {
        return sum + (event.currentRegistrations || 0);
      }, 0) || 0;

      setStats({
        totalEvents,
        totalCategories,
        totalAttendees,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Keep default values if API fails
      setStats(prev => ({ ...prev, loading: false }));
    }
  };
  return (
    <>
      <main className="page-container text-center">
        <div className="section-gap">
          {/* Status Badge */}
          <div className="status-pill mb-8">
            Now live in Alpha!
          </div>

          {/* Hero Headline */}
          <h1 className="text-display mb-8 max-w-4xl mx-auto">
            Discover Amazing Events in Your City
          </h1>

          {/* Subtext */}
          <p className="text-body mb-12 max-w-2xl mx-auto text-fog-gray">
            Join thousands of people discovering and attending incredible events.
            From tech workshops to sports training, find your perfect experience.
          </p>

          {/* CTA */}
          <Link to="/events">
            <Button variant="pill" size="lg" className="mb-16">
              Start Exploring Events
            </Button>
          </Link>

          {/* Product Showcase with Spectrum Background */}
          <div className="relative flex justify-center items-center mb-16">
            <div className="spectrum-background"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative z-10">
              <div className="text-center">
                <div className="text-heading font-bold mb-2">
                  {stats.loading ? '...' : stats.totalEvents.toLocaleString()}
                </div>
                <div className="text-caption">Active Events</div>
              </div>
              <div className="text-center">
                <div className="text-heading font-bold mb-2">
                  {stats.loading ? '...' : stats.totalCategories.toLocaleString()}
                </div>
                <div className="text-caption">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-heading font-bold mb-2">
                  {stats.loading ? '...' : stats.totalAttendees.toLocaleString()}
                </div>
                <div className="text-caption">Happy Attendees</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="page-container section-gap">
        <div className="text-center mb-16">
          <h2 className="text-heading-lg mb-4">Why Choose EventHub</h2>
          <p className="text-body text-fog-gray max-w-2xl mx-auto">
            Everything you need to discover, join, and organize amazing events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="icon-circle">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-subheading mb-3">Easy Discovery</h3>
            <p className="text-body text-fog-gray">
              Find events that match your interests with our smart search and filtering system.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="icon-circle">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-subheading mb-3">Simple Registration</h3>
            <p className="text-body text-fog-gray">
              Register for events with just a few clicks. Track your registrations in one place.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="icon-circle">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-subheading mb-3">Real-time Updates</h3>
            <p className="text-body text-fog-gray">
              Get notified about event changes, new events, and important announcements.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="lilac-section">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-heading-lg mb-4">What People Say</h2>
            <p className="text-body text-fog-gray">
              Join thousands of satisfied event-goers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-testimonial">
              <p className="text-body mb-4 italic">
                "EventHub made it so easy to find tech meetups in my area. I've learned so much!"
              </p>
              <p className="text-caption">— Sarah Chen, Developer</p>
            </div>

            <div className="card-testimonial">
              <p className="text-body mb-4 italic">
                "The registration process is seamless. I can track all my events in one place."
              </p>
              <p className="text-caption">— Michael Rodriguez, Designer</p>
            </div>

            <div className="card-testimonial">
              <p className="text-body mb-4 italic">
                "Great platform for discovering new experiences. Highly recommend!"
              </p>
              <p className="text-caption">— Emily Johnson, Student</p>
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="page-container section-gap text-center">
          <h2 className="text-heading-lg mb-4">Ready to Start?</h2>
          <p className="text-body text-fog-gray mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already discovering amazing events in their cities.
          </p>
          <Link to="/register">
            <Button variant="pill" size="lg">
              Get Started Today
            </Button>
          </Link>
        </section>
      )}

      {/* Footer */}
      <footer className="page-container py-12 border-t border-fog-gray/20">
        <div className="text-center text-caption text-fog-gray">
          <p>&copy; 2026 EventHub. Built with React, Express & MongoDB.</p>
        </div>
      </footer>
    </>
  );
};

function App() {
  return (
    <ToastProvider>
      <DialogProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-cream-canvas">
              <Navigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-event"
                  element={
                    <ProtectedRoute>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </DialogProvider>
    </ToastProvider>
  );
}

export default App;