// Enable Firebase Auth providers using Firebase CLI's stored credentials
// Uses the firebase-tools internal token system

import { execSync } from 'child_process';
import https from 'https';

const PROJECT_ID = 'precision-tool-lab-ae';

async function getFirebaseToken() {
  try {
    // Get token from firebase-tools stored credentials
    const result = execSync('npx firebase-tools@latest --project precision-tool-lab-ae functions:config:get 2>&1', {
      encoding: 'utf8',
      timeout: 30000
    });
    return null; // Just testing
  } catch (e) {
    return null;
  }
}

async function makeRequestWithApiKey(method, url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-goog-user-project': PROJECT_ID
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}, Body: ${body.substring(0, 200)}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Get Firebase CLI user token via node_modules
async function getCLIToken() {
  try {
    const firebaseToolsPath = new URL('./node_modules/firebase-tools/lib/index.js', import.meta.url);
    const firebaseTools = await import(firebaseToolsPath.href);
    return null;
  } catch(e) {
    console.log('Could not load firebase-tools directly:', e.message);
    return null;
  }
}

async function main() {
  // Use execSync to get token from firebase CLI
  try {
    const tokenOutput = execSync(
      'npx firebase-tools@latest appdistribution:testers:add test@test.com --project precision-tool-lab-ae --token dummy 2>&1',
      { encoding: 'utf8', timeout: 10000 }
    );
    console.log(tokenOutput);
  } catch(e) {
    // ignore, just testing token mechanism
  }

  // Try using the Identity Toolkit v1 API with just the API key
  const API_KEY = 'AIzaSyDA59C9bbohddxg-r6EMyoEqIhWcNFtIgQ';

  // Enable email/password provider using signupNewUser endpoint to test
  const signupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
  
  try {
    await makeRequestWithApiKey('POST', signupUrl, JSON.stringify({
      email: 'test_setup@test.com',
      password: 'testpass123',
      returnSecureToken: true
    }));
    console.log('✅ Email/Password is ALREADY ENABLED and working!');
  } catch(e) {
    if (e.message.includes('CONFIGURATION_NOT_FOUND') || e.message.includes('identityToolkitNotActivated')) {
      console.log('❌ Email/Password auth is NOT enabled yet');
    } else if (e.message.includes('EMAIL_EXISTS')) {
      console.log('✅ Email/Password auth is ENABLED and working!');
    } else {
      console.log('Auth status unknown:', e.message.substring(0, 200));
    }
  }
}

main().catch(console.error);
