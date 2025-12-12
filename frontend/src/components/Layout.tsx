import React from 'react';
import { Outlet } from 'react-router-dom';

import StickyHeader from './StickyHeader';

const Layout: React.FC = () => {

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            <StickyHeader />

            {/* Add padding-top to account for fixed header */}
            <div className="pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
