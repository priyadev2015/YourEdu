import crypto from 'crypto';

// The pilot code is "Thanks4Piloting!"
const PILOT_CODE_HASH = '7f3e89f22f78c924f43436c7f9d17145a6149f7e1a54c8f1b6c68f2e6c367389'; // Pre-computed hash

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { hashedCode } = req.body;

    if (!hashedCode) {
      return res.status(400).json({ error: 'Pilot code is required' });
    }

    // Compare the hashes
    if (hashedCode === PILOT_CODE_HASH) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ error: 'Invalid pilot code' });
    }
  } catch (error) {
    console.error('Error verifying pilot code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 