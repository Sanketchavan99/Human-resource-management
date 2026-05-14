import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Image,
} from "@heroui/react";
import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react";
import companyService from '../services/companyService';
import userService from '../services/userService';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);

  // Fetch company logo for employees
  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!user || !user.id) return;

      try {
        // Fetch user's complete profile to get companyId
        const response = await companyService.getMyCompanyLogo();
        if (response?.data?.success) {
          setCompanyLogo(response.data.logoPath);
        }
      } catch (error) {
        console.error('Error fetching company logo:', error);
      }
    };

    if (user) {
      fetchCompanyLogo();
    }
  }, [user]);

  const menuItems = user ? [
    ...(user.role === 'employee' ? [
      { name: 'Dashboard', link: '/dashboard', icon: 'mdi:view-dashboard' },
      { name: 'Profile', link: '/profile/view', icon: 'mdi:account' },
    ] : []),
    ...(user.role === 'employer' ? [
      { name: 'Company Dashboard', link: '/company/dashboard', icon: 'mdi:office-building' },
      { name: 'Add Employees', link: '/company/add-employees', icon: 'mdi:account-plus' },
    ] : []),
    ...(user.role === 'admin' ? [
      { name: 'Dashboard', link: '/admin', icon: 'mdi:view-dashboard' },
      { name: 'Enquiries', link: '/admin/enquiries', icon: 'mdi:inbox' },
    ] : []),
  ] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <NextUINavbar
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      height="64px"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to={user ? (user.role === 'employer' ? '/company/dashboard' : '/dashboard') : "/"} className="flex items-center gap-3">
            {/* App Logo */}

            {/* Company Logo for Employees */}

            <Image
              src={companyLogo ? `${import.meta.env.VITE_API_URL}/${companyLogo}` : "https://hirelyft.in/Hirelyft.jpg"}
              alt="Company Logo"
              className="h-16 object-contain"
            />




          </Link>
        </NavbarBrand>
      </NavbarContent>

      {user && (
        <NavbarContent className="hidden sm:flex gap-6" justify="center">
          {user.role === 'employee' && (
            <>
              <NavbarItem>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
                >
                  <Icon icon="mdi:view-dashboard" className="text-lg" />
                  Dashboard
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link
                  to="/profile/view"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
                >
                  <Icon icon="mdi:account" className="text-lg" />
                  Profile
                </Link>
              </NavbarItem>
            </>
          )}
          {user.role === 'employer' && (
            <>
              <NavbarItem>
                <Link
                  to="/company/dashboard"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
                >
                  <Icon icon="mdi:office-building" className="text-lg" />
                  Company Dashboard
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link
                  to="/company/add-employees"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
                >
                  <Icon icon="mdi:account-plus" className="text-lg" />
                  Add Employees
                </Link>
              </NavbarItem>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <NavbarItem>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
                >
                  <Icon icon="mdi:view-dashboard" className="text-lg" />
                  Dashboard
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link
                  to="/admin/enquiries"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
                >
                  <Icon icon="mdi:inbox" className="text-lg" />
                  Enquiries
                </Link>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      )}

      <NavbarContent justify="end" className="gap-4">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.firstName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user.role || 'Employee'}</p>
                </div>
                <Avatar
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user.firstName || 'User'}
                  size="sm"
                  src={user.avatarUrl ? `${import.meta.env.VITE_API_URL}/${user.avatarUrl}` : undefined}
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue="profile">
                <p className="font-semibold text-gray-600">Signed in as</p>
                <p className="font-semibold text-gray-900">{user.email || user.empCode}</p>
              </DropdownItem>
              <DropdownItem
                key="my_profile"
                onClick={() => navigate('/profile/view')}
                startContent={<Icon icon="mdi:account" className="text-lg" />}
              >
                My Profile
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onClick={handleLogout}
                startContent={<Icon icon="mdi:logout" className="text-lg" />}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <Link to="/enquiry">
              <Button
                color="default"
                variant="flat"
                size="md"
                startContent={<Icon icon="mdi:message-text" />}
              >
                Contact Us
              </Button>
            </Link>
            <Link to="/login">
              <Button
                color="primary"
                variant="solid"
                size="md"
                startContent={<Icon icon="mdi:login" />}
              >
                Login
              </Button>
            </Link>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="bg-white dark:bg-gray-800 pt-6">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              to={item.link}
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon icon={item.icon} className="text-xl text-blue-600 dark:text-blue-400" />
              <span className="text-base font-medium text-gray-900 dark:text-white">{item.name}</span>
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold mt-4"
            onPress={handleLogout}
            startContent={<Icon icon="mdi:logout" />}
          >
            Logout
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </NextUINavbar>
  );
}
