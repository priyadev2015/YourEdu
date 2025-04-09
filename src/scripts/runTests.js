import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import testEmailServices from '../utils/emailServices/testEmailServices.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env files
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('REACT_APP_RESEND_API_KEY:', process.env.REACT_APP_RESEND_API_KEY ? '✓' : '✗');
console.log('REACT_APP_CUSTOMERIO_API_KEY:', process.env.REACT_APP_CUSTOMERIO_API_KEY ? '✓' : '✗');
console.log('REACT_APP_CUSTOMERIO_SITE_ID:', process.env.REACT_APP_CUSTOMERIO_SITE_ID ? '✓' : '✗');
console.log('REACT_APP_MAILCHIMP_API_KEY:', process.env.REACT_APP_MAILCHIMP_API_KEY ? '✓' : '✗');
console.log('REACT_APP_MAILCHIMP_SERVER_PREFIX:', process.env.REACT_APP_MAILCHIMP_SERVER_PREFIX ? '✓' : '✗');
console.log('REACT_APP_MAILCHIMP_LIST_ID:', process.env.REACT_APP_MAILCHIMP_LIST_ID ? '✓' : '✗');
console.log('REACT_APP_HUBSPOT_API_KEY:', process.env.REACT_APP_HUBSPOT_API_KEY ? '✓' : '✗');

console.log('\n🚀 Starting email service integration tests...');
console.log('📧 Using test email: colin@youredu.school\n');

// Override the test user in testEmailServices
const testUser = {
  id: 'test-user-' + Date.now(),
  email: 'colin@youredu.school',
  first_name: 'Colin',
  last_name: 'Grant',
  user_type: 'test',
  created_at: new Date().toISOString()
};

testEmailServices(testUser)
  .then(results => {
    console.log('\n📝 Summary:');
    Object.entries(results).forEach(([service, result]) => {
      const status = result.success ? '✅ PASSED' : '❌ FAILED';
      console.log(`${service}: ${status}`);
      
      if (!result.success) {
        console.error(`Error: ${result.error}`);
      } else {
        // Log successful operations
        switch (service) {
          case 'resend':
            console.log('- Contact created and test email sent');
            break;
          case 'customerio':
            console.log('- User identified and event tracked');
            break;
          case 'mailchimp':
            console.log('- Subscriber added and test campaign created');
            break;
        }
      }
    });
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }); 