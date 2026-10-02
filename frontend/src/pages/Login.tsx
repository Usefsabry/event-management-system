import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="full-height-center bg-cream-canvas">
            <div className="page-container">
                <div className="centered-content">
                    <div className="w-full max-w-md">
                        <div className="card">
                            <div className="text-center mb-8">
                                <h1 className="text-heading-lg mb-4">Welcome Back</h1>
                                <p className="text-body text-fog-gray">
                                    Sign in to your EventHub account to continue discovering amazing events.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="email" className="block text-body font-medium text-warm-graphite mb-4">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-body font-medium text-warm-graphite mb-4">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="pill"
                                    size="lg"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-fog-gray/20 text-center">
                                <p className="text-caption text-fog-gray">
                                    Don't have an account?{' '}
                                    <a href="/register" className="text-warm-graphite font-medium hover:underline">
                                        Sign up here
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};