import React from 'react';

export const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-cream-canvas">
            <div className="page-container section-gap pt-12 md:pt-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-display mb-6">About EventHub</h1>
                    <p className="text-body text-fog-gray mb-8">
                        EventHub is your ultimate platform for discovering, registering, and managing events. 
                        Whether you're looking for tech workshops, sports activities, or business conferences, 
                        we bring the community together in one place.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left">
                        <div className="card">
                            <div className="icon-circle mb-4 bg-mist-blue">
                                <svg className="w-6 h-6 text-warm-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-subheading mb-3">Our Mission</h3>
                            <p className="text-body text-fog-gray">
                                To connect people with shared interests by making event discovery and registration as seamless and accessible as possible.
                            </p>
                        </div>
                        <div className="card">
                            <div className="icon-circle mb-4 bg-spectrum-wash">
                                <svg className="w-6 h-6 text-warm-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-subheading mb-3">Our Vision</h3>
                            <p className="text-body text-fog-gray">
                                Becoming the go-to global platform for community-driven events, empowering organizers and attendees alike.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
