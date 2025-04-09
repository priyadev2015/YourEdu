import mailchimp from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';

let client = null;

const initMailchimp = () => {
  if (!client && process.env.REACT_APP_MAILCHIMP_API_KEY && process.env.REACT_APP_MAILCHIMP_SERVER_PREFIX) {
    try {
      mailchimp.setConfig({
        apiKey: process.env.REACT_APP_MAILCHIMP_API_KEY,
        server: process.env.REACT_APP_MAILCHIMP_SERVER_PREFIX
      });
      client = mailchimp;
      return client;
    } catch (error) {
      console.error('Failed to initialize Mailchimp:', error);
      return null;
    }
  }
  return client;
};

// Calculate MD5 hash of lowercase email address
const calculateListMemberHash = (email) => {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
};

export const mailchimpService = {
  // Test the connection and get account info
  async testConnection() {
    try {
      const client = initMailchimp();
      if (!client) {
        throw new Error('Mailchimp client not initialized - missing API keys');
      }

      console.log('Testing Mailchimp ping...');
      const pingResponse = await client.ping.get();
      console.log('Ping response:', pingResponse);

      if (pingResponse && pingResponse.health_status === "Everything's Chimpy!") {
        try {
          console.log('Getting account info...');
          const accountInfo = await client.lists.getAllLists();
          console.log('Account info retrieved successfully');
          return true;
        } catch (error) {
          console.error('Failed to get account info:', error);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Mailchimp connection test failed:', error);
      return false;
    }
  },

  // Get all lists/audiences
  async getLists() {
    try {
      const client = initMailchimp();
      if (!client) {
        throw new Error('Mailchimp client not initialized - missing API keys');
      }

      console.log('Fetching Mailchimp lists...');
      const response = await client.lists.getAllLists();
      console.log(`Found ${response.lists?.length || 0} lists`);
      return response.lists;
    } catch (error) {
      console.error('Mailchimp get lists error:', error);
      throw error;
    }
  },

  // Add or update a subscriber
  async upsertSubscriber(userData, listId = process.env.REACT_APP_MAILCHIMP_LIST_ID) {
    try {
      const client = initMailchimp();
      if (!client) {
        throw new Error('Mailchimp client not initialized - missing API keys');
      }

      if (!listId) {
        throw new Error('No list ID provided or found in environment variables');
      }

      const subscriberHash = calculateListMemberHash(userData.email);
      
      console.log(`Adding/updating subscriber ${userData.email} to list ${listId}`);
      const result = await client.lists.setListMember(listId, subscriberHash, {
        email_address: userData.email,
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: userData.first_name,
          LNAME: userData.last_name,
          USERTYPE: userData.user_type,
          ADDRESS: {
            addr1: '2627 Hanover St',
            addr2: '',
            city: 'Palo Alto',
            state: 'CA',
            zip: '94304',
            country: 'US'
          },
          COMPANY: 'YourEDU'
        }
      });
      
      return result;
    } catch (error) {
      console.error('Mailchimp upsert subscriber error:', error);
      throw error;
    }
  },

  // Batch import subscribers
  async batchImport(users, listId = process.env.REACT_APP_MAILCHIMP_LIST_ID) {
    try {
      const client = initMailchimp();
      if (!client) {
        throw new Error('Mailchimp client not initialized - missing API keys');
      }

      const operations = users.map(user => ({
        method: 'POST',
        path: `/lists/${listId}/members`,
        body: JSON.stringify({
          email_address: user.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: user.first_name,
            LNAME: user.last_name,
            USERTYPE: user.user_type
          },
          tags: [user.user_type]
        })
      }));

      const result = await client.batch.start(operations);
      return result;
    } catch (error) {
      console.error('Mailchimp batch import error:', error);
      throw error;
    }
  },

  // Send a transactional email
  async sendEmail(emailData) {
    try {
      const client = initMailchimp();
      if (!client) {
        throw new Error('Mailchimp client not initialized - missing API keys');
      }

      const result = await client.messages.send({
        message: {
          to: [{ email: emailData.to }],
          subject: emailData.subject,
          html: emailData.html,
          from_email: 'onboarding@youredu.org',
          from_name: 'YourEDU'
        }
      });
      return result;
    } catch (error) {
      console.error('Mailchimp send email error:', error);
      throw error;
    }
  },

  // Create a new campaign
  async createCampaign(subject, html, options = {}) {
    const client = initMailchimp();
    if (!client) {
      throw new Error('Mailchimp client not initialized - missing API keys');
    }
    const listId = process.env.REACT_APP_MAILCHIMP_LIST_ID;
    if (!listId) {
      throw new Error('No list ID provided or found in environment variables');
    }

    const campaignData = {
      type: 'regular',
      recipients: {
        list_id: listId
      },
      settings: {
        subject_line: String(subject),
        title: String(subject),
        from_name: 'YourEDU',
        reply_to: 'colin@youredu.school',
        from_email: 'colin@youredu.school'
      }
    };

    try {
      const campaign = await client.campaigns.create(campaignData);
      if (campaign.id) {
        await client.campaigns.setContent(campaign.id, {
          html: html
        });
      }
      return campaign;
    } catch (error) {
      console.error('Error creating Mailchimp campaign:', error);
      throw error;
    }
  }
}; 