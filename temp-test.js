
        const { getStripeConfigManager } = require('./src/lib/stripeConfigManager.ts');
        const { getStripeAutomation } = require('./src/lib/stripeAutomation.ts');
        
        console.log('Testing config manager...');
        const configManager = getStripeConfigManager();
        console.log('Config manager:', configManager ? 'OK' : 'NULL');
        
        console.log('Testing automation service...');
        const automation = getStripeAutomation();
        console.log('Automation service:', automation ? 'OK' : 'NULL');
      