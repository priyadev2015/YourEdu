import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
    AiOutlineHome,
    AiOutlineFileText,
    AiOutlineDown,
    AiOutlineRight,
} from 'react-icons/ai';
import {
    BsBook,
    BsCompass,
    BsChatDots,
    BsPerson,
} from 'react-icons/bs';
import { FiLogOut } from 'react-icons/fi';

const LAFireNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [isComplianceOpen, setIsComplianceOpen] = useState(false);

    const navItems = [
        { icon: AiOutlineHome, label: 'Home', path: '/' },
        { icon: BsBook, label: 'Course Search', path: '/courses' },
        {
            icon: AiOutlineFileText,
            label: 'CA Compliance',
            children: [
                { label: 'State regulation overview', path: '/compliance/regulations' },
                { label: 'State and local filing', path: '/compliance/filing' },
                { label: 'Funding opportunities', path: '/compliance/funding' }
            ]
        },
        { icon: BsCompass, label: 'Testing Resources', path: '/testing' },
        { icon: BsChatDots, label: 'Contact Support', path: '/support' },
    ];

    const bottomNavItems = [
        { icon: BsPerson, label: 'My Account', path: '/account' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login/parent');
    };

    const isActive = (path) => {
        if (!path) return false;
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const renderNavItem = (item) => {
        if (item.children) {
            return (
                <div key={item.label}>
                    <div
                        style={{
                            ...styles.navItem,
                            ...(isComplianceOpen ? styles.activeNavItem : {})
                        }}
                        onClick={() => setIsComplianceOpen(!isComplianceOpen)}
                    >
                        <span style={styles.icon}><item.icon /></span>
                        {item.label}
                        <span style={styles.chevron}>
                            {isComplianceOpen ? <AiOutlineDown /> : <AiOutlineRight />}
                        </span>
                    </div>
                    {isComplianceOpen && (
                        <div style={styles.submenu}>
                            {item.children.map((child) => (
                                <div
                                    key={child.path}
                                    style={{
                                        ...styles.navItem,
                                        ...styles.submenuItem,
                                        ...(isActive(child.path) ? styles.activeNavItem : {})
                                    }}
                                    onClick={() => navigate(child.path)}
                                >
                                    {child.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div
                key={item.path}
                style={{
                    ...styles.navItem,
                    ...(isActive(item.path) ? styles.activeNavItem : {})
                }}
                onClick={() => navigate(item.path)}
            >
                <span style={styles.icon}><item.icon /></span>
                {item.label}
            </div>
        );
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.logoContainer}>
                <h1 style={styles.brandName}>LA Fire Education Aid</h1>
            </div>

            <div style={styles.navItems}>
                {navItems.map(renderNavItem)}
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
                        <span style={styles.icon}><item.icon /></span>
                        {item.label}
                    </div>
                ))}
                <div
                    style={styles.navItem}
                    onClick={handleLogout}
                >
                    <span style={styles.icon}><FiLogOut /></span>
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
        justifyContent: 'center',
        padding: '20px 16px',
        marginTop: '10px',
        marginBottom: '10px',
        backgroundColor: '#2B6CB0',
    },
    brandName: {
        fontSize: '15px',
        fontWeight: '600',
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        textAlign: 'center',
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
        position: 'relative',
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
    chevron: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
    },
    submenu: {
        borderLeft: '1px solid #e2e8f0',
        marginLeft: '24px',
    },
    submenuItem: {
        paddingLeft: '48px',
    },
    bottomContent: {
        borderTop: '1px solid #e2e8f0',
        padding: '20px 0',
    },
};

export default LAFireNavbar; 