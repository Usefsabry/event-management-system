import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { authApi } from '../services/api';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const validatePassword = (password: string): string | null => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const validateName = (name: string): string | null => {
        if (name.length < 2) {
            return 'Name must be at least 2 characters long';
        }
        if (name.length > 50) {
            return 'Name cannot exceed 50 characters';
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Name can only contain letters and spaces';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate name
        const nameError = validateName(formData.name);
        if (nameError) {
            setError(nameError);
            setLoading(false);
            return;
        }

        // Validate password
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Password confirmation does not match password');
            setLoading(false);
            return;
        }

        try {
            await authApi.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            setSuccess(true);

            // Automatically redirect to login after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="py-12 flex items-center justify-center">
                <div className="page-container w-full">
                    <div className="max-w-md mx-auto">
                        <div className="card text-center">
                            <div className="icon-circle mb-6 bg-green-100">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-heading-lg mb-4">Registration Successful!</h1>
                            <p className="text-body text-fog-gray mb-6">
                                Your account has been created successfully. You will be redirected to the login page shortly.
                            </p>
                            <Button variant="pill" onClick={() => navigate('/login')}>
                                Go to Login
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 flex items-center justify-center">
            <div className="page-container w-full">
                <div className="max-w-md mx-auto">
                    <div className="card">
                        <div className="text-center mb-8">
                            <h1 className="text-heading-lg mb-4">Create Your Account</h1>
                            <p className="text-body text-fog-gray">
                                Join EventHub to start discovering and organizing amazing events in your city.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-body font-medium text-warm-graphite mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite transition-colors"
                                    placeholder="Enter your full name"
                                />
                                <p className="text-caption text-fog-gray mt-1">
                                    Name must be 2-50 characters, letters and spaces only
                                </p>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-body font-medium text-warm-graphite mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite transition-colors"
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-body font-medium text-warm-graphite mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite transition-colors"
                                    placeholder="Enter your password"
                                />
                                <p className="text-caption text-fog-gray mt-1">
                                    Password must be at least 6 characters with uppercase, lowercase, and number
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-body font-medium text-warm-graphite mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-full border border-fog-gray/30 bg-paper-white text-warm-graphite focus:outline-none focus:border-warm-graphite transition-colors"
                                    placeholder="Confirm your password"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    required
                                    className="rounded border-fog-gray/30 text-warm-graphite focus:border-warm-graphite focus:ring-warm-graphite"
                                />
                                <span className="ml-2 text-caption text-fog-gray">
                                    I agree to the{' '}
                                    <a href="#" className="text-warm-graphite font-medium hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-warm-graphite font-medium hover:underline">Privacy Policy</a>
                                </span>
                            </div>

                            <Button
                                type="submit"
                                variant="pill"
                                size="lg"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-fog-gray/20">
                            <p className="text-center text-caption text-fog-gray">
                                Already have an account?{' '}
                                <a href="/login" className="text-warm-graphite font-medium hover:underline">
                                    Sign in here
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};