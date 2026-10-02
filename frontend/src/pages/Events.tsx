import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { eventsApi, categoriesApi } from '../services/api';
import type { Event } from '../types/api';

export const EventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [debouncedSearchTerm, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getAll();
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (debouncedSearchTerm.trim()) filters.search = debouncedSearchTerm.trim();
            if (selectedCategory) filters.category = selectedCategory;

            const data = await eventsApi.getAll(filters);
            setEvents(data.events || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, selectedCategory]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (error) {
        return (
            <div className="min-h-screen bg-cream-canvas">
                <div className="py-8">
                    <div className="page-container">
                        <div className="text-center">
                            <div className="card max-w-md mx-auto">
                                <div className="text-heading mb-4 text-red-600">Error: {error}</div>
                                <p className="text-body text-fog-gray mb-6">
                                    Make sure the backend server is running on port 5000.
                                </p>
                                <Button onClick={fetchEvents} variant="pill">Try Again</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-canvas">
            <div className="py-8">
                <div className="page-container">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-display mb-4">All Events</h1>
                        <p className="text-body text-fog-gray max-w-2xl mx-auto">
                            Discover amazing events happening in your area. Filter by category or search for specific topics.
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input pr-10"
                                />
                                {searchTerm !== debouncedSearchTerm && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-warm-graphite"></div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search Results Info */}
                        {(debouncedSearchTerm || selectedCategory) && (
                            <div className="mt-4 text-center">
                                <p className="text-caption text-fog-gray">
                                    {loading ? 'Searching...' :
                                        `Found ${events.length} event${events.length !== 1 ? 's' : ''} ${debouncedSearchTerm ? `for "${debouncedSearchTerm}"` : ''
                                        } ${selectedCategory ? `in ${categories.find(c => c._id === selectedCategory)?.name || 'selected category'}` : ''
                                        }`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-16">
                            <div className="text-heading mb-4 text-warm-graphite">Loading Events...</div>
                            <div className="text-body text-fog-gray">Please wait while we fetch the latest events.</div>
                        </div>
                    )}

                    {/* Events Grid */}
                    {!loading && (
                        <>
                            {events.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="card max-w-md mx-auto">
                                        <div className="icon-circle mb-6 mx-auto">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-heading mb-4">No Events Found</div>
                                        <p className="text-body text-fog-gray mb-6">
                                            {debouncedSearchTerm || selectedCategory
                                                ? 'Try adjusting your search or filter criteria.'
                                                : 'No events are currently available. Check back later!'}
                                        </p>
                                        {(debouncedSearchTerm || selectedCategory) && (
                                            <Button
                                                variant="pill"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setSelectedCategory('');
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {events.map((event) => (
                                        <div key={event._id} className="card">
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="status-pill text-xs">
                                                        {event.category?.name || 'No Category'}
                                                    </span>
                                                    <span className="text-caption text-fog-gray">
                                                        {Math.max(0, event.capacity - event.currentRegistrations)} spots left
                                                    </span>
                                                </div>

                                                <h3 className="text-subheading mb-2">{event.title}</h3>

                                                <p className="text-body text-fog-gray mb-4 line-clamp-3">
                                                    {event.description}
                                                </p>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center text-caption text-fog-gray">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDate(event.date)} at {event.startTime} - {event.endTime}
                                                    </div>

                                                    <div className="flex items-center text-caption text-fog-gray">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {event.location}
                                                    </div>

                                                    <div className="flex items-center text-caption text-fog-gray">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Organized by {event.createdBy?.name || 'Unknown'}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-heading text-warm-graphite">
                                                        {event.price === 0 ? 'Free' : `$${event.price}`}
                                                    </span>
                                                    <Link to={`/events/${event._id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Load More Button */}
                            {events.length > 0 && events.length >= 10 && (
                                <div className="text-center mt-12">
                                    <Button variant="pill" size="lg">
                                        Load More Events
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};