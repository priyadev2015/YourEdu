import { Client } from '@hubspot/api-client';

let hubspotClient;

const initHubspot = () => {
  if (!hubspotClient && process.env.REACT_APP_HUBSPOT_API_KEY) {
    hubspotClient = new Client({ accessToken: process.env.REACT_APP_HUBSPOT_API_KEY });
  }
  return hubspotClient;
};

export const hubspotService = {
  // Test the connection
  async testConnection() {
    try {
      const client = initHubspot();
      if (!client) {
        throw new Error('HubSpot client not initialized - missing API key');
      }

      // Test the connection by getting account info
      const response = await client.crm.contacts.basicApi.getPage();
      console.log('HubSpot connection test successful');
      return true;
    } catch (error) {
      console.error('HubSpot connection test failed:', error);
      return false;
    }
  },

  // Create or update a contact
  async upsertContact(userData) {
    try {
      const client = initHubspot();
      if (!client) {
        throw new Error('HubSpot client not initialized - missing API key');
      }

      // Search for existing contact
      const searchResponse = await client.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: userData.email
          }]
        }]
      });

      let contact;
      const properties = {
        email: userData.email,
        firstname: userData.first_name,
        lastname: userData.last_name
      };

      if (searchResponse.total === 0) {
        // Create new contact
        contact = await client.crm.contacts.basicApi.create({
          properties: properties
        });
      } else {
        // Update existing contact
        const existingContact = searchResponse.results[0];
        contact = await client.crm.contacts.basicApi.update(
          existingContact.id,
          { properties: properties }
        );
      }

      return contact;
    } catch (error) {
      console.error('HubSpot contact upsert error:', error);
      throw error;
    }
  },

  // Create and send an email using HubSpot's transactional email API
  async sendEmail(emailData) {
    try {
      const client = initHubspot();
      if (!client) {
        throw new Error('HubSpot client not initialized - missing API key');
      }

      // Note: This requires Marketing Hub Professional or Enterprise
      const response = await client.marketing.transactional.singleSendApi.sendEmail({
        emailId: emailData.templateId,
        message: {
          to: emailData.to,
          from: emailData.from || 'onboarding@youredu.org',
          subject: emailData.subject
        },
        contactProperties: emailData.properties || {}
      });

      return response;
    } catch (error) {
      console.error('HubSpot send email error:', error);
      throw error;
    }
  },

  // Create a list
  async createList(name, filters = []) {
    try {
      const client = initHubspot();
      if (!client) {
        throw new Error('HubSpot client not initialized - missing API key');
      }

      // Create a list using the Lists API
      const response = await client.marketing.lists.create({
        name: name,
        dynamic: false,
        filters: filters
      });

      return response;
    } catch (error) {
      console.error('HubSpot create list error:', error);
      throw error;
    }
  }
}; 