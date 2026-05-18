import { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { LogOut, Moon, Sun, User, Menu, X } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileModal from "./ProfileModal";
import gsap from "gsap";

const Layout = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = localStorage.getItem("role") || "guest";

  const navRef = useRef(null);
  const logoRef = useRef(null);
  const navItemsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const overlayRef = useRef(null);
  const mainRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar entrance
      gsap.fromTo(navRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );

      // Logo shimmer
      if (logoRef.current) {
        gsap.fromTo(logoRef.current,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, delay: 0.2, ease: "back.out(1.7)" }
        );
      }

      // Nav items stagger
      if (navItemsRef.current) {
        gsap.fromTo(navItemsRef.current.children,
          { y: -10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.3, ease: "power2.out" }
        );
      }

      // Main content
      gsap.fromTo(mainRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: "power2.out" }
      );

      // Footer
      gsap.fromTo(footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 0.6, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  // Mobile menu animations
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(mobileMenuRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.35, ease: "power3.out" }
      );
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    gsap.to(mobileMenuRef.current, {
      x: "100%", duration: 0.25, ease: "power3.in"
    });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.2, ease: "power2.in",
      onComplete: () => setIsMobileMenuOpen(false)
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans flex flex-col relative"
         style={{ background: 'var(--gradient-bg)', color: 'var(--text-primary)' }}>

      {/* Subtle background orbs for dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="orb orb-sm-1" />
        <div className="orb orb-sm-2" />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDarkMode ? "dark" : "light"}
        toastStyle={{
          backdropFilter: 'blur(20px)',
          background: isDarkMode ? 'rgba(17,17,39,0.9)' : 'rgba(255,255,255,0.9)',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? 'rgba(99,102,241,0.15)' : 'rgba(148,163,184,0.2)'}`,
        }}
      />

      {/* Glassmorphic Navbar */}
      <nav ref={navRef} className="glass-navbar sticky top-0 z-50" style={{ opacity: 0 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link ref={logoRef} to={`/${role === 'guest' ? '' : role}`} className="flex-shrink-0 flex items-center group" style={{ opacity: 0 }}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-3 shadow-lg group-hover:shadow-indigo-500/30 transition-shadow duration-300">
                <span className="text-white font-black text-sm">H</span>
              </div>
              <span className="text-xl font-extrabold gradient-text-animated hidden sm:block">
                Hostel Activity Management
              </span>
              <span className="text-xl font-extrabold gradient-text-animated sm:hidden">
                HAM
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <div ref={navItemsRef} className="hidden md:flex items-center space-x-3">
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-xl cursor-pointer glass transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="capitalize">{role}</span>
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl glass transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/25 hover:-translate-y-0.5 active:scale-95"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl glass transition-all"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            ref={overlayRef}
            className="fixed inset-0 z-[60] mobile-menu-overlay"
            onClick={closeMobileMenu}
            style={{ opacity: 0 }}
          />
          <div
            ref={mobileMenuRef}
            className="fixed top-0 right-0 bottom-0 w-72 z-[70] mobile-menu-drawer p-6 flex flex-col"
            style={{ transform: 'translateX(100%)' }}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold gradient-text">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-xl glass transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <div
                onClick={() => { setIsProfileModalOpen(true); closeMobileMenu(); }}
                className="flex items-center space-x-3 p-3 rounded-xl glass cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Profile</p>
                  <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{role}</p>
                </div>
              </div>

              <button
                onClick={() => { setIsDarkMode(!isDarkMode); }}
                className="flex items-center space-x-3 p-3 rounded-xl glass w-full text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  {isDarkMode ? <Sun size={16} className="text-white" /> : <Moon size={16} className="text-white" />}
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>

            <button
              onClick={() => { handleLogout(); closeMobileMenu(); }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white p-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-rose-500/25 active:scale-95"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10" style={{ opacity: 0 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer ref={footerRef} className="relative z-10 mt-auto" style={{ opacity: 0 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Gradient line */}
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mb-6" />
          <div className="py-6">
            <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              &copy; {new Date().getFullYear()} Hostel Activity Management System. Crafted with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
