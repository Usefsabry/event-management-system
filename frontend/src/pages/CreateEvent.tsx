import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { categoriesApi, eventsApi } from '../services/api';

interface Category {
    _id: string;
    name: string;
}

export const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        capacity: '',
        price: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getAll();
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await eventsApi.create({
                ...formData,
                capacity: parseInt(formData.capacity),
                price: parseFloat(formData.price) || 0
            });

            // Redirect to event details
            navigate(`/events/${data.event._id}`);

        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-8">
            <div className="page-container">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-display mb-4">Create New Event</h1>
                        <p className="text-body text-fog-gray">
                            Share your amazing event with the community and bring people together.
                        </p>
                    </div>

                    <div className="card">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-body font-medium text-warm-graphite mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite"
                                    placeholder="Enter event title"
                                />
                            </div>

                            <div>
                                <label className="block text-body font-medium text-warm-graphite mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite resize-none"
                                    placeholder="Describe your event..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-body font-medium text-warm-graphite mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-body font-medium text-warm-graphite mb-2">
                                        Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite"
                                        placeholder="Max attendees"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-body font-medium text-warm-graphite mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite"
                                    />
                                </div>

                                <div>
                                    <label className="block text-body font-medium text-warm-graphite mb-2">
                                        Start Time *
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite"
                                    />
                                </div>
                                <div>
                                    <label className="block text-body font-medium text-warm-graphite mb-2">
                                        End Time *
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-body font-medium text-warm-graphite mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite"
                                    placeholder="Event location or venue"
                                />
                            </div>

                            <div>
                                <label className="block text-body font-medium text-warm-graphite mb-2">
                                    Price (Leave empty for free event)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-fog-gray/20">
                                <button
                                    type="button"
                                    onClick={() => navigate('/events')}
                                    className="btn-ghost"
                                >
                                    Cancel
                                </button>

                                <Button
                                    type="submit"
                                    variant="pill"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Event'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};