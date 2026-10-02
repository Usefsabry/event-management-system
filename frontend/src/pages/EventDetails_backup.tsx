import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { eventsApi, registrationsApi } from '../services/api';
import type { Event } from '../types/api';

export const EventDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

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
            const data = await registrationsApi.getMyRegistrations();
            const registered = data.registrations.some((reg: any) => reg.event._id === id || reg.event === id);
            setIsRegistered(registered);
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
            alert(err.response?.data?.message || 'Failed to load registrations');
        }
    };

    const handleDeleteEvent = async () => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            if (!id) return;
            await eventsApi.delete(id);
            navigate('/events', { replace: true });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete event');
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
            // Update event registered count
            if (event) {
                setEvent({
                    ...event,
                    currentRegistrations: event.currentRegistrations + 1
                });
            }

        } catch (err: any) {
            alert(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setRegistering(false);
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
                <div className="page-container section-gap">
                    <div className="text-center">
                        <div className="text-heading mb-4">Loading Event...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-cream-canvas">
                <div className="page-container section-gap">
                    <div className="text-center">
                        <div className="text-heading mb-4">Event Not Found</div>
                        <p className="text-body text-fog-gray mb-8">
                            {error || 'The event you\'re looking for doesn\'t exist.'}
                        </p>
                        <Button onClick={() => navigate('/events')}>
                            Back to Events
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const spotsLeft = event.capacity - event.currentRegistrations;
    const isFull = spotsLeft <= 0;

    return (
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
                    <div className="card">
                        {/* Event Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <span className="status-pill">
                                    {event.category.name}
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
                                        <div className="text-body font-medium">{event.createdBy?.name || 'Unknown'}</div>
                                        <div className="text-caption text-fog-gray">Event Organizer</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Registration Section */}
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
                    </div>
                </div>
            </div>
        </div>
    );
};