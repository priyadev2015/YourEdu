import pkg from 'customerio-node';
const { TrackClient } = pkg;

let customerio;

const initCustomerio = () => {
  if (!customerio && process.env.REACT_APP_CUSTOMERIO_SITE_ID && process.env.REACT_APP_CUSTOMERIO_API_KEY) {
    const siteId = process.env.REACT_APP_CUSTOMERIO_SITE_ID.trim();
    const apiKey = process.env.REACT_APP_CUSTOMERIO_API_KEY.trim();
    
    customerio = new TrackClient(siteId, apiKey, {
      region: 1, // 1 for US, 2 for EU
      retryCount: 3,
      timeout: 10000
    });
  }
  return customerio;
};

export const customerioService = {
  // Identify/Update a user in Customer.io
  async identifyUser(userData) {
    try {
      const client = initCustomerio();
      if (!client) {
        throw new Error('Customer.io client not initialized - missing API keys');
      }

      const result = await client.identify(userData.id, {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_type: userData.user_type,
        created_at: Math.floor(new Date(userData.created_at || Date.now()).getTime() / 1000)
      });
      return result;
    } catch (error) {
      console.error('Customer.io identify user error:', error);
      throw error;
    }
  },

  // Batch import users
  async batchImport(users) {
    try {
      const client = initCustomerio();
      if (!client) {
        throw new Error('Customer.io client not initialized - missing API keys');
      }

      const results = await Promise.all(
        users.map(user => this.identifyUser(user))
      );
      return results;
    } catch (error) {
      console.error('Customer.io batch import error:', error);
      throw error;
    }
  },

  // Send transactional email using a template
  async sendTemplateEmail(emailData) {
    try {
      const client = initCustomerio();
      if (!client) {
        throw new Error('Customer.io client not initialized - missing API keys');
      }

      const result = await client.sendEmail(emailData.userId, {
        transactional_message_id: emailData.templateId,
        to: emailData.to,
        identifiers: {
          email: emailData.to
        },
        message_data: emailData.data || {}
      });
      return result;
    } catch (error) {
      console.error('Customer.io send email error:', error);
      throw error;
    }
  },

  // Track an event
  async trackEvent(userId, eventName, data = {}) {
    try {
      const client = initCustomerio();
      if (!client) {
        throw new Error('Customer.io client not initialized - missing API keys');
      }

      const result = await client.track(userId, {
        name: eventName,
        data: data
      });
      return result;
    } catch (error) {
      console.error('Customer.io track event error:', error);
      throw error;
    }
  },

  // Test the connection using the CDP API
  async testConnection() {
    try {
      if (!process.env.REACT_APP_CUSTOMERIO_API_KEY) {
        throw new Error('Customer.io API key not found');
      }

      const testUser = {
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        user_type: 'test'
      };

      const response = await fetch('https://cdp.customer.io/v1/identify', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.REACT_APP_CUSTOMERIO_API_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUser.id,
          traits: {
            name: `${testUser.first_name} ${testUser.last_name}`,
            email: testUser.email
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Customer.io connection test successful');
      return true;
    } catch (error) {
      console.error('Customer.io connection test failed:', error);
      return false;
    }
  }
}; 