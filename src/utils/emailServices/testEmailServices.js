import { resendService } from './resendService.js';
import { customerioService } from './customerioService.js';
import { mailchimpService } from './mailchimpService.js';
import { hubspotService } from './hubspotService.js';

// Default test data
const defaultTestUser = {
  id: 'test-user-' + Date.now(),
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  user_type: 'test',
  created_at: new Date().toISOString()
};

export const testEmailServices = async (testUser = defaultTestUser) => {
  const results = {
    resend: null,
    customerio: null,
    mailchimp: null,
    hubspot: null
  };

  console.log('Starting email services tests...');
  console.log('Using test user:', testUser.email);

  // Test Resend
  try {
    console.log('\nTesting Resend...');
    
    // Test connection
    console.log('Testing Resend connection...');
    const resendConnected = await resendService.testConnection();
    console.log('Resend connection test:', resendConnected ? 'SUCCESS' : 'FAILED');

    if (resendConnected) {
      // Test contact creation
      console.log('Testing Resend contact creation...');
      const contact = await resendService.upsertContact(testUser);
      console.log('Resend contact created:', contact);

      // Test email sending
      console.log('Testing Resend email sending...');
      const emailResult = await resendService.sendEmail({
        to: testUser.email,
        subject: 'Test Email from Resend',
        html: '<h1>Hello from Resend!</h1>',
        text: 'Hello from Resend!'
      });
      console.log('Resend email sent:', emailResult);

      results.resend = { success: true, contact, emailResult };
    }
  } catch (error) {
    console.error('Resend test error:', error);
    results.resend = { success: false, error: error.message };
  }

  // Test Customer.io
  try {
    console.log('\nTesting Customer.io...');
    
    // Test connection
    console.log('Testing Customer.io connection...');
    const customerioConnected = await customerioService.testConnection();
    console.log('Customer.io connection test:', customerioConnected ? 'SUCCESS' : 'FAILED');

    if (customerioConnected) {
      // Test user identification
      console.log('Testing Customer.io user identification...');
      const identifyResult = await customerioService.identifyUser(testUser);
      console.log('Customer.io user identified:', identifyResult);

      // Test event tracking
      console.log('Testing Customer.io event tracking...');
      const eventResult = await customerioService.trackEvent(testUser.id, 'test_event', {
        test: true,
        timestamp: new Date().toISOString()
      });
      console.log('Customer.io event tracked:', eventResult);

      results.customerio = { success: true, identifyResult, eventResult };
    }
  } catch (error) {
    console.error('Customer.io test error:', error);
    results.customerio = { success: false, error: error.message };
  }

  // Test Mailchimp
  try {
    console.log('\nTesting Mailchimp...');
    
    // Test connection
    console.log('Testing Mailchimp connection...');
    const mailchimpConnected = await mailchimpService.testConnection();
    console.log('Mailchimp connection test:', mailchimpConnected ? 'SUCCESS' : 'FAILED');

    if (mailchimpConnected) {
      // Get available lists
      console.log('Getting Mailchimp lists...');
      const lists = await mailchimpService.getLists();
      console.log('Mailchimp lists:', lists);

      if (lists && lists.length > 0) {
        const testListId = lists[0].id;
        
        // Test subscriber addition
        console.log('Testing Mailchimp subscriber addition...');
        const subscriberResult = await mailchimpService.upsertSubscriber(testUser, testListId);
        console.log('Mailchimp subscriber added:', subscriberResult);

        // Test campaign creation
        console.log('Testing Mailchimp campaign creation...');
        const campaignResult = await mailchimpService.createCampaign({
          subject: 'Test Campaign',
          title: 'Test Campaign Title',
          segmentOpts: {
            match: 'all',
            conditions: [{
              field: 'user_type',
              op: 'eq',
              value: 'test'
            }]
          }
        });
        console.log('Mailchimp campaign created:', campaignResult);

        results.mailchimp = { 
          success: true, 
          lists, 
          subscriberResult, 
          campaignResult 
        };
      }
    }
  } catch (error) {
    console.error('Mailchimp test error:', error);
    results.mailchimp = { success: false, error: error.message };
  }

  // Test HubSpot
  try {
    console.log('\nTesting HubSpot...');
    
    // Test connection
    console.log('Testing HubSpot connection...');
    const hubspotConnected = await hubspotService.testConnection();
    console.log('HubSpot connection test:', hubspotConnected ? 'SUCCESS' : 'FAILED');

    if (hubspotConnected) {
      // Test contact creation/update
      console.log('Testing HubSpot contact creation...');
      const contact = await hubspotService.upsertContact(testUser);
      console.log('HubSpot contact created:', contact);

      // Test list creation
      console.log('Testing HubSpot list creation...');
      const list = await hubspotService.createList('Test List ' + Date.now());
      console.log('HubSpot list created:', list);

      results.hubspot = { 
        success: true, 
        contact,
        list
      };
    }
  } catch (error) {
    console.error('HubSpot test error:', error);
    results.hubspot = { success: false, error: error.message };
  }

  console.log('\nTest Results:', results);
  return results;
};

export default testEmailServices;

// Example usage:
// import { testEmailServices } from './testEmailServices';
// testEmailServices().catch(console.error); 