import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Activity } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    const role = localStorage.getItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userID');
    navigate('/login');
  };

  const isLoggedIn = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isOpen ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 shadow-lg' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              EMC<span className="font-light text-slate-300">Healthcare</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {(!role || role !== 'doctor') && navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-all hover:text-green-400 relative group ${location.pathname === link.path ? 'text-green-400' : 'text-slate-300'
                  }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 transition-all group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`} />
              </Link>
            ))}

            {role === 'doctor' && (
              <>
                <Link to="/" className="text-sm font-medium transition-all hover:text-green-400 text-slate-300">Home</Link>
                <Link to="/doctor-dashboard" className="text-sm font-medium transition-all hover:text-green-400 text-slate-300">Dashboard</Link>
              </>
            )}

            {role === 'receptionist' && (
              <>
                <Link to="/" className="text-sm font-medium transition-all hover:text-green-400 text-slate-300">Home</Link>
                <Link to="/receptionist-dashboard" className="text-sm font-medium transition-all hover:text-green-400 text-slate-300">Billing</Link>
              </>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium text-sm transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/registration"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-slate-300" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-700 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {(role !== 'doctor') && navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block text-lg font-medium ${location.pathname === link.path ? 'text-green-400' : 'text-slate-300'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              {role === 'doctor' && (
                <>
                  <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-slate-300">Home</Link>
                  <Link to="/doctor-dashboard" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-slate-300">Dashboard</Link>
                </>
              )}
              {role === 'receptionist' && (
                <>
                  <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-slate-300">Home</Link>
                  <Link to="/receptionist-dashboard" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-slate-300">Billing</Link>
                </>
              )}
              <div className="pt-4 border-t border-slate-700 flex flex-col gap-3">
                {!isLoggedIn && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/registration"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3 rounded-xl bg-green-600 text-white font-semibold"
                    >
                      Get Started
                    </Link>
                  </>
                )}
                {isLoggedIn && (
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full text-center py-3 rounded-xl bg-red-600/20 text-red-500 border border-red-500/50 font-semibold"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
