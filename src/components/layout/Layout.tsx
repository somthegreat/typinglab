import React from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen bg-background">
      {showNav && <Navbar />}
      <main className={showNav ? "pt-16 pb-20 md:pb-8" : ""}>
        {children}
      </main>
      {showNav && <MobileNav />}
    </div>
  );
};

export default Layout;
