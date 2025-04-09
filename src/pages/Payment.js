// src/pages/Payment.js

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../utils/AuthContext';

const stripePromise = loadStripe('your-publishable-key-here');

const Payment = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    });

    const session = await response.json();

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome to YourEDU</h1>
      <p style={styles.text}>
        YourEDU provides all the tools you need to manage your homeschooling journey, from generating transcripts to applying for colleges. Subscribe now for just $X per month to get access to all features!
      </p>
      <div style={styles.screenshots}>
        {/* Add some screenshots here */}
        <img src="screenshot1.png" alt="Feature 1" style={styles.screenshot} />
        <img src="screenshot2.png" alt="Feature 2" style={styles.screenshot} />
      </div>
      <button 
        style={styles.checkoutButton} 
        onClick={handleCheckout} 
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
      <button style={styles.logoutButton} onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  header: {
    fontSize: '32px',
    marginBottom: '20px',
  },
  text: {
    fontSize: '18px',
    marginBottom: '30px',
  },
  screenshots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  screenshot: {
    width: '200px',
    borderRadius: '10px',
  },
  checkoutButton: {
    fontSize: '18px',
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  logoutButton: {
    fontSize: '16px',
    marginTop: '20px',
    padding: '8px 16px',
    backgroundColor: '#FF5733',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Payment;
