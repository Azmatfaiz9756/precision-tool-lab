// Create admin user in Firebase Auth via REST API
import https from 'https';

const API_KEY = 'AIzaSyDA59C9bbohddxg-r6EMyoEqIhWcNFtIgQ';

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        const json = JSON.parse(b);
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
        else reject(new Error(json.error?.message || `HTTP ${res.statusCode}`));
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const email = 'admin@tsttools.com';
  const password = 'Admin@123';

  try {
    // Try to create account
    const result = await post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    console.log(`✅ Admin account CREATED!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   UID: ${result.localId}`);
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') {
      console.log(`✅ Admin account already exists!`);
      console.log(`   Email: ${email}`);
      // Try to update password
      try {
        // Sign in first to verify
        const signIn = await post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
          { email, password, returnSecureToken: true }
        );
        console.log(`   Login test: ✅ WORKS with password "${password}"`);
      } catch (e2) {
        console.log(`   ⚠️  Current password may be different: ${e2.message}`);
      }
    } else {
      console.log(`❌ Error: ${err.message}`);
    }
  }
}

main();
