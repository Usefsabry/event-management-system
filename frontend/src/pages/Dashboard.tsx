import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDialog } from '../contexts/DialogContext';
import { registrationsApi, eventsApi } from '../services/api';
import type { Registration, Event } from '../types/api';

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const { confirm } = useDialog();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            // Fetch both registrations and my events (only confirmed registrations)
            const [registrationsData, eventsData] = await Promise.all([
                registrationsApi.getMyRegistrations({ status: 'confirmed' }),
                eventsApi.getMyEvents()
            ]);

            setRegistrations(registrationsData.registrations || []);
            setMyEvents(eventsData.events || []);
        } catch (err: any) {
            console.error('Dashboard fetch error:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load dashboard data';
            setErrorMsg(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const cancelRegistration = async (registrationId: string) => {
        const confirmed = await confirm({
            title: 'Cancel registration?',
            message: 'Are you sure you want to cancel this registration? You can register again later if you change your mind.',
            confirmLabel: 'Yes, cancel',
            cancelLabel: 'Keep it',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            // Find the registration to get the event ID, as cancel API expects eventId
            const reg = registrations.find(r => r._id === registrationId);
            if (!reg) {
                showError('Registration not found');
                return;
            }

            console.log('Canceling registration:', registrationId, 'for event:', reg.event._id);

            // Call the API
            await registrationsApi.cancel(reg.event._id);

            console.log('Registration canceled successfully');

            // Show success message
            success('Registration canceled successfully!');

            // Refresh data from server to ensure consistency
            await fetchData();

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel registration';
            console.error('Cancel registration error:', err);
            showError(errorMessage);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isEventPast = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    const upcomingEvents = registrations.filter(reg => !isEventPast(reg.event.date));
    const pastEvents = registrations.filter(reg => isEventPast(reg.event.date));

    return (
        <div className="min-h-screen bg-cream-canvas">
            <div className="py-8">
                <div className="page-container">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-display mb-4">Welcome back, {user?.name || 'User'}!</h1>
                            <p className="text-body text-fog-gray">
                                Manage your event registrations and discover new opportunities.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            <div className="card text-center">
                                <div className="text-heading font-bold mb-2">{upcomingEvents.length}</div>
                                <div className="text-caption text-fog-gray">Upcoming Events</div>
                            </div>
                            <div className="card text-center">
                                <div className="text-heading font-bold mb-2">{pastEvents.length}</div>
                                <div className="text-caption text-fog-gray">Past Events</div>
                            </div>
                            <div className="card text-center">
                                <div className="text-heading font-bold mb-2">{myEvents.length}</div>
                                <div className="text-caption text-fog-gray">My Events</div>
                            </div>
                            <div className="card text-center">
                                <div className="text-heading font-bold mb-2">{registrations.length}</div>
                                <div className="text-caption text-fog-gray">Total Registered</div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="text-center mb-12 space-x-4">
                            <Link to="/events">
                                <Button variant="pill" size="lg">
                                    Discover New Events
                                </Button>
                            </Link>
                            <Link to="/create-event">
                                <Button variant="ghost" size="lg">
                                    Create New Event
                                </Button>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="text-center py-16">
                                <div className="text-heading mb-4 text-warm-graphite">Loading your events...</div>
                                <div className="text-body text-fog-gray">Please wait while we fetch your registrations.</div>
                            </div>
                        ) : errorMsg ? (
                            <div className="text-center py-16">
                                <div className="card max-w-md mx-auto">
                                    <div className="text-heading mb-4 text-red-600">Oops! Something went wrong</div>
                                    <p className="text-body text-fog-gray mb-6">{errorMsg}</p>
                                    <Button onClick={fetchData} variant="pill">
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* My Created Events */}
                                {myEvents.length > 0 && (
                                    <div className="mb-12">
                                        <h2 className="text-heading-lg mb-8">My Events</h2>
                                        <div className="space-y-6">
                                            {myEvents.map((event) => (
                                                <div key={event._id} className="card">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                                <span className="status-pill">
                                                                    {event.category?.name || 'No Category'}
                                                                </span>
                                                                <span className="text-caption text-fog-gray">
                                                                    {formatDate(event.date)} at {event.startTime}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-subheading mb-2">{event.title}</h3>

                                                            <div className="flex items-center gap-4 text-caption text-fog-gray mb-4">
                                                                <span>{event.currentRegistrations}/{event.capacity} registered</span>
                                                                <span>{event.location}</span>
                                                                <span>{event.price === 0 ? 'Free' : `$${event.price}`}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <Link to={`/events/${event._id}`}>
                                                                <Button variant="pill" size="sm">
                                                                    Manage Event
                                                                </Button>
                                                            </Link>
                                                            <span className="text-caption text-fog-gray">
                                                                Created by you
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Upcoming Events */}
                                {upcomingEvents.length > 0 && (
                                    <div className="mb-12">
                                        <h2 className="text-heading-lg mb-8">Upcoming Events</h2>
                                        <div className="space-y-6">
                                            {upcomingEvents.map((registration) => (
                                                <div key={registration._id} className="card">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                                <span className="status-pill">
                                                                    {registration.event.category.name}
                                                                </span>
                                                                <span className="text-caption text-fog-gray">
                                                                    {formatDate(registration.event.date)} at {registration.event.startTime}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-subheading mb-2">{registration.event.title}</h3>

                                                            <div className="flex items-center text-caption text-fog-gray mb-4">
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {registration.event.location}
                                                            </div>

                                                            <div className="text-body font-medium">
                                                                Price: {registration.event.price === 0 ? 'Free' : `$${registration.event.price}`}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <Link to={`/events/${registration.event._id}`}>
                                                                <Button variant="ghost" size="sm">
                                                                    View Details
                                                                </Button>
                                                            </Link>
                                                            <button
                                                                onClick={() => cancelRegistration(registration._id)}
                                                                className="cancel-btn text-caption text-red-600 hover:text-red-700 px-3 py-1 rounded-full border border-red-200 hover:border-red-300 transition-all duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Past Events */}
                                {pastEvents.length > 0 && (
                                    <div className="mb-12">
                                        <h2 className="text-heading-lg mb-8">Past Events</h2>
                                        <div className="space-y-6">
                                            {pastEvents.map((registration) => (
                                                <div key={registration._id} className="card opacity-75">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                                <span className="status-pill">
                                                                    {registration.event.category.name}
                                                                </span>
                                                                <span className="text-caption text-fog-gray">
                                                                    {formatDate(registration.event.date)} at {registration.event.startTime}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-subheading mb-2">{registration.event.title}</h3>

                                                            <div className="flex items-center text-caption text-fog-gray">
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {registration.event.location}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <span className="status-pill bg-gray-100 text-gray-600">
                                                                Completed
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {registrations.length === 0 && myEvents.length === 0 && (
                                    <div className="text-center">
                                        <div className="card max-w-md mx-auto">
                                            <div className="icon-circle mb-6 mx-auto">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-subheading mb-4">No Events Yet</h3>
                                            <p className="text-body text-fog-gray mb-6">
                                                You haven't registered for any events yet. Start discovering amazing events in your area!
                                            </p>
                                            <Link to="/events">
                                                <Button variant="pill">
                                                    Browse Events
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};