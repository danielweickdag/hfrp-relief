import fs from 'fs/promises';
import path from 'path';

async function verifyAutonoma() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = await fs.readFile(envPath, 'utf8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
      }
    });

    const clientId = envVars['AUTONOMA_CLIENT_ID'];
    const secretId = envVars['AUTONOMA_SECRET_ID'];

    console.log('--- Autonoma Configuration Check ---');
    if (clientId && secretId) {
      console.log('✅ AUTONOMA_CLIENT_ID found');
      console.log('✅ AUTONOMA_SECRET_ID found');
      console.log(`Client ID: ${clientId.substring(0, 5)}...`);
      return true;
    } else {
      console.error('❌ Missing Autonoma credentials in .env.local');
      if (!clientId) console.error('   - Missing AUTONOMA_CLIENT_ID');
      if (!secretId) console.error('   - Missing AUTONOMA_SECRET_ID');
      return false;
    }
  } catch (error) {
    console.error('Error reading .env.local:', error.message);
    return false;
  }
}

verifyAutonoma();
