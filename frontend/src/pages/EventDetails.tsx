import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDialog } from '../contexts/DialogContext';
import { eventsApi, registrationsApi } from '../services/api';
import type { Event } from '../types/api';

export const EventDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { success, error: showError } = useToast();
    const { confirm } = useDialog();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
    const [showRegistrations, setShowRegistrations] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEvent();
            if (isAuthenticated) {
                checkRegistration();
            }
        }
    }, [id, isAuthenticated]);

    const fetchEvent = async () => {
        try {
            if (!id) return;
            const data = await eventsApi.getById(id);
            setEvent(data.event as any);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async () => {
        try {
            if (!id) return;
            const data = await registrationsApi.getStatus(id);
            setIsRegistered(!!data.registrationInfo?.isRegistered);
        } catch (err) {
            console.error('Error checking registration:', err);
        }
    };

    const fetchEventRegistrations = async () => {
        try {
            if (!id) return;
            const data = await registrationsApi.getEventRegistrations(id);
            setEventRegistrations(data.registrations || []);
            setShowRegistrations(true);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to load registrations');
        }
    };

    const handleRegister = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!id) return;
        setRegistering(true);
        try {
            await registrationsApi.register(id);
            setIsRegistered(true);
            await fetchEvent();
            success('You are registered for this event.');
        } catch (err: any) {
            showError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    const handleDeleteEvent = async () => {
        const confirmed = await confirm({
            title: 'Delete this event?',
            message: 'Are you sure you want to delete this event? This action cannot be undone.',
            confirmLabel: 'Delete event',
            cancelLabel: 'Keep event',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            if (!id) return;
            await eventsApi.delete(id);
            success('Event deleted successfully.');
            navigate('/events', { replace: true });
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to delete event');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-canvas">
                <div className="py-8">
                    <div className="page-container">
                        <div className="text-center">
                            <div className="text-heading mb-4">Loading Event...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (error || !event) {
        return (
            <div className="min-h-screen bg-cream-canvas">
                <div className="py-8">
                    <div className="page-container">
                        <div className="text-center">
                            <div className="card max-w-md mx-auto">
                                <div className="text-heading mb-4">Event Not Found</div>
                                <p className="text-body text-fog-gray mb-6">
                                    {error || 'The event you\'re looking for doesn\'t exist.'}
                                </p>
                                <Button onClick={() => navigate('/events')} variant="pill">
                                    Back to Events
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const spotsLeft = event.capacity - event.currentRegistrations;
    const isFull = spotsLeft <= 0;
    const isEventOwner = user && event.createdBy && (user._id === event.createdBy._id || user._id === event.createdBy);

    return (
        <div className="min-h-screen bg-cream-canvas">
            <div className="py-8">
                <div className="page-container">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/events')}
                        className="btn-ghost mb-8 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Events
                    </button>

                    <div className="max-w-4xl mx-auto">
                        {/* Event Owner Management Panel */}
                        {isEventOwner && (
                            <div className="card mb-8 bg-mist-blue">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-subheading mb-2">Event Management</h3>
                                        <p className="text-body text-fog-gray">
                                            You are the organizer of this event. Manage your attendees and event details.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={fetchEventRegistrations}
                                            variant="pill"
                                            size="sm"
                                        >
                                            View Registrations ({event.currentRegistrations})
                                        </Button>
                                        <Button
                                            onClick={handleDeleteEvent}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Delete Event
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Event Registrations Panel */}
                        {showRegistrations && isEventOwner && (
                            <div className="card mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-heading">Event Registrations</h3>
                                    <button
                                        onClick={() => setShowRegistrations(false)}
                                        className="btn-ghost"
                                    >
                                        ✕ Close
                                    </button>
                                </div>

                                {eventRegistrations.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="icon-circle mb-4 mx-auto">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-subheading mb-2">No Registrations Yet</h4>
                                        <p className="text-body text-fog-gray">
                                            When people register for your event, they'll appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center mb-4">
                                            <p className="text-body text-fog-gray">
                                                Total: <span className="font-medium">{eventRegistrations.length}</span> registrations
                                            </p>
                                        </div>
                                        {eventRegistrations.map((registration, index) => (
                                            <div key={registration._id || index} className="flex items-center justify-between p-4 bg-cream-canvas rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="icon-circle w-10 h-10">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-body font-medium">{registration.user?.name || 'Unknown User'}</div>
                                                        <div className="text-caption text-fog-gray">{registration.user?.email || 'No email'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`status-pill text-xs ${registration.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        registration.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {registration.status}
                                                    </span>
                                                    <span className="text-caption text-fog-gray">
                                                        {new Date(registration.registeredAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="card">
                            {/* Event Header */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="status-pill">
                                        {event.category?.name || 'No Category'}
                                    </span>
                                    <span className="text-caption text-fog-gray">
                                        {isFull ? 'Event Full' : `${spotsLeft} spots left`}
                                    </span>
                                </div>

                                <h1 className="text-display mb-4">{event.title}</h1>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="flex items-center text-body text-fog-gray">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDate(event.date)}
                                    </div>
                                    <div className="flex items-center text-body text-fog-gray">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {event.startTime} - {event.endTime}
                                    </div>

                                    <div className="flex items-center text-body text-fog-gray">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {event.location}
                                    </div>
                                </div>
                            </div>

                            {/* Event Description */}
                            <div className="mb-8">
                                <h2 className="text-heading mb-4">About This Event</h2>
                                <p className="text-body text-fog-gray leading-relaxed whitespace-pre-line">
                                    {event.description}
                                </p>
                            </div>

                            {/* Event Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-subheading mb-4">Event Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-body text-fog-gray">Price:</span>
                                            <span className="text-body font-medium">
                                                {event.price === 0 ? 'Free' : `$${event.price}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-body text-fog-gray">Capacity:</span>
                                            <span className="text-body font-medium">{event.capacity} people</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-body text-fog-gray">Registered:</span>
                                            <span className="text-body font-medium">{event.currentRegistrations} people</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-subheading mb-4">Organizer</h3>
                                    <div className="flex items-center">
                                        <div className="icon-circle w-12 h-12 mr-4">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-body font-medium">
                                                {event.createdBy?.name || 'Unknown'}
                                                {isEventOwner && (
                                                    <span className="ml-2 text-caption text-warm-graphite font-medium">(You)</span>
                                                )}
                                            </div>
                                            <div className="text-caption text-fog-gray">Event Organizer</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Section - Only show if not event owner */}
                            {!isEventOwner && (
                                <div className="border-t border-fog-gray/20 pt-8">
                                    {isRegistered ? (
                                        <div className="text-center">
                                            <div className="icon-circle mb-4 bg-green-100 mx-auto">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="text-subheading mb-2">You're Registered!</h3>
                                            <p className="text-body text-fog-gray">
                                                You've successfully registered for this event. See you there!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-heading mb-4">
                                                {event.price === 0 ? 'Free Event' : `$${event.price}`}
                                            </div>

                                            {isFull ? (
                                                <div>
                                                    <p className="text-body text-fog-gray mb-4">
                                                        This event is currently full. Check back later for cancellations.
                                                    </p>
                                                    <Button disabled>
                                                        Event Full
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-body text-fog-gray mb-4">
                                                        {isAuthenticated
                                                            ? 'Ready to join this amazing event?'
                                                            : 'Please login to register for this event'
                                                        }
                                                    </p>
                                                    <Button
                                                        onClick={handleRegister}
                                                        disabled={registering}
                                                        variant="pill"
                                                        size="lg"
                                                    >
                                                        {registering
                                                            ? 'Registering...'
                                                            : isAuthenticated
                                                                ? 'Register Now'
                                                                : 'Login to Register'
                                                        }
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Event Owner Info Section */}
                            {isEventOwner && (
                                <div className="border-t border-fog-gray/20 pt-8">
                                    <div className="text-center">
                                        <div className="icon-circle mb-4 bg-blue-100 mx-auto">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-subheading mb-2">This is Your Event</h3>
                                        <p className="text-body text-fog-gray">
                                            You created this event. Use the management panel above to view registrations and manage your event.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};