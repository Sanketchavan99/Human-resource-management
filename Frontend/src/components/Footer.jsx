import { Link } from 'react-router-dom';
import { Icon } from "@iconify/react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: 'Home', to: '/dashboard', icon: 'mdi:home' },
    { name: 'Profile', to: '/profile/view', icon: 'mdi:account' },
    { name: 'Help', to: '#', icon: 'mdi:help-circle' },
  ];

  const social = [
    { icon: 'mdi:linkedin', href: '#' },
    { icon: 'mdi:twitter', href: '#' },
    { icon: 'mdi:facebook', href: '#' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                HR-Management
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Simplifying employee management for modern workplaces.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.to} 
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Icon icon={link.icon} className="text-base" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Contact Us</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Icon icon="mdi:email" className="inline mr-2" />
              support@HR-Management.com
            </p>
            <div className="flex gap-3">
              {social.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon={item.icon} className="text-xl" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} HR-Management. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}