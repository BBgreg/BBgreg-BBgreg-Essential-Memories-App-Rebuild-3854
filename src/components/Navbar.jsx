import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiPlus, FiCalendar, FiTarget, FiUser } = FiIcons;

const Navbar = () => {
  const location = useLocation();
  console.log("🧭 Navbar: Bottom navigation bar rendered for mobile web app");
  console.log("DEBUG: Bottom Navigation Bar - Active button gradient applied. (Change 3)");
  console.log("DEBUG: Bottom navigation button order verified. (Change 3)");

  const navItems = [
    { path: '/home', icon: FiHome, label: 'Home', color: 'text-pink-500' },
    { path: '/calendar', icon: FiCalendar, label: 'Calendar', color: 'text-purple-500' },
    { path: '/add-memory', icon: FiPlus, label: 'Add', color: 'text-teal-500' },
    { path: '/practice', icon: FiTarget, label: 'Practice', color: 'text-orange-500' },
    { path: '/profile', icon: FiUser, label: 'Profile', color: 'text-indigo-500' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bottom-nav bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg mx-auto transition-all">
        <div className="flex justify-around items-center py-2 px-4">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const isAddButton = item.path === '/add-memory';
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center p-2 min-w-[60px] transition-all duration-300"
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-pink-500 to-teal-400 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-pink-300 to-teal-200 text-white shadow-lg'
                      : isAddButton
                      ? 'bg-gradient-to-r from-pink-500/10 to-teal-400/10 text-teal-500'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <SafeIcon
                    icon={item.icon}
                    className={`text-xl ${active ? 'text-white' : item.color}`}
                  />
                </motion.div>

                {/* Label */}
                <span
                  className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                    active ? 'text-gray-800' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;