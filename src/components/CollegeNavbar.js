import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Logo from '../assets/logo.png';
import { 
  HomeOutlined,
  FileTextOutlined,
  BankOutlined,
  DollarOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const CollegeNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const mainNavItems = [
    { 
      title: 'Home',
      path: '/',
      icon: <HomeOutlined />
    },
    {
      title: 'Admin Materials',
      path: '/admin-materials',
      icon: <FileTextOutlined />
    },
    {
      title: 'Colleges',
      path: '/school-search',
      icon: <BankOutlined />
    },
    {
      title: 'Scholarships',
      path: '/scholarships',
      icon: <DollarOutlined />
    }
  ];

  const bottomNavItems = [
    {
      title: 'My Account',
      path: '/account',
      icon: <UserOutlined />
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login/parent');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logoContainer} onClick={() => navigate('/')}>
        <img
          src={Logo}
          alt="YourEDU Logo"
          style={styles.logo}
        />
        <span style={styles.brandName}>YourEDU</span>
      </div>
      <div style={styles.navItems}>
        {mainNavItems.map((item) => (
          <div
            key={item.path}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.activeNavItem : {})
            }}
            onClick={() => navigate(item.path)}
          >
            <span style={styles.icon}>{item.icon}</span>
            {item.title}
          </div>
        ))}
      </div>

      <div style={styles.bottomContent}>
        {bottomNavItems.map((item) => (
          <div
            key={item.path}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.activeNavItem : {})
            }}
            onClick={() => navigate(item.path)}
          >
            <span style={styles.icon}>{item.icon}</span>
            {item.title}
          </div>
        ))}
        <div
          style={styles.navItem}
          onClick={handleLogout}
        >
          <span style={styles.icon}><LogoutOutlined /></span>
          Log Out
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    width: '250px',
    backgroundColor: '#ffffff',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e2e8f0',
    zIndex: 1000,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    cursor: 'pointer',
    borderBottom: '1px solid #e2e8f0',
  },
  logo: {
    width: '32px',
    height: '32px',
    marginRight: '12px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2B6CB0',
  },
  navItems: {
    padding: '20px 0',
    flex: 1,
    overflowY: 'auto',
  },
  navItem: {
    padding: '12px 24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#4a5568',
    fontSize: '14px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f7fafc',
    },
  },
  activeNavItem: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    fontWeight: '500',
  },
  icon: {
    marginRight: '12px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
  },
  bottomContent: {
    borderTop: '1px solid #e2e8f0',
    padding: '20px 0',
  },
};

export default CollegeNavbar; 