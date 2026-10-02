import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-cream-canvas flex items-center justify-center">
            <div className="page-container">
                <div className="text-center max-w-md mx-auto">
                    <div className="mb-8">
                        <div className="text-display mb-4">404</div>
                        <h1 className="text-heading-lg mb-4">Page Not Found</h1>
                        <p className="text-body text-fog-gray mb-8">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/">
                            <Button variant="pill" size="lg">
                                Go Home
                            </Button>
                        </Link>
                        <Link to="/events">
                            <Button variant="ghost" size="lg">
                                Browse Events
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};