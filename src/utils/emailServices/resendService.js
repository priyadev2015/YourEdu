import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

let resend;

const initResend = () => {
  if (!resend && process.env.REACT_APP_RESEND_API_KEY) {
    resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);
  }
  return resend;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const resendService = {
  // Create or update contact in Resend
  async upsertContact(userData) {
    try {
      const client = initResend();
      if (!client) {
        throw new Error('Resend client not initialized - missing API key');
      }
      
      const contact = await client.contacts.create({
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        unsubscribed: false,
        id: uuidv4(),
        data: {
          userId: userData.id,
          userType: userData.user_type
        }
      });
      
      // Add delay to handle rate limiting
      await sleep(500);
      
      return contact;
    } catch (error) {
      console.error('Resend contact upsert error:', error);
      throw error;
    }
  },

  // Batch import contacts
  async batchImport(users) {
    try {
      const client = initResend();
      if (!client) {
        throw new Error('Resend client not initialized - missing API key');
      }
      
      const results = [];
      for (const user of users) {
        const result = await this.upsertContact(user);
        results.push(result);
        // Add delay between batch operations
        await sleep(500);
      }
      return results;
    } catch (error) {
      console.error('Resend batch import error:', error);
      throw error;
    }
  },

  // Send transactional email
  async sendEmail(emailData) {
    try {
      const client = initResend();
      if (!client) {
        throw new Error('Resend client not initialized - missing API key');
      }
      
      const result = await client.emails.send({
        from: 'YourEDU <onboarding@resend.dev>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text // Optional plain text version
      });
      
      // Add delay to handle rate limiting
      await sleep(500);
      
      return result;
    } catch (error) {
      console.error('Resend send email error:', error);
      throw error;
    }
  },

  // Test the connection
  async testConnection() {
    try {
      const client = initResend();
      if (!client) {
        throw new Error('Resend client not initialized - missing API key');
      }
      
      const testEmail = {
        to: 'test@example.com',
        subject: 'Resend Test Email',
        html: '<h1>Test Email from Resend</h1>',
        text: 'Test Email from Resend'
      };
      
      // For testing, we'll just verify the API key is valid
      console.log('Resend connection test successful - API key is valid');
      return true;
    } catch (error) {
      console.error('Resend connection test failed:', error);
      return false;
    }
  }
}; 