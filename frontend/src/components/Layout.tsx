import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StickyHeader from './StickyHeader';

const Layout: React.FC = () => {
    const location = useLocation();
    const isWorkspace = location.pathname.startsWith('/visualizer/');

    return (
        <div className="av-app">
            <StickyHeader />
            <main className={isWorkspace ? 'av-app__main--workspace' : 'av-page-shell'}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;