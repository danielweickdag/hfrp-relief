import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getStripeConfigManager } from "@/lib/stripeConfigManager";
import { stripeAutomation } from "@/lib/stripeAutomation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Webhook event handlers
const eventHandlers = {
  'payment_intent.succeeded': handlePaymentIntentSucceeded,
  'payment_intent.payment_failed': handlePaymentIntentFailed,
  'customer.created': handleCustomerCreated,
  'customer.updated': handleCustomerUpdated,
  'invoice.payment_succeeded': handleInvoicePaymentSucceeded,
  'invoice.payment_failed': handleInvoicePaymentFailed,
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'checkout.session.completed': handleCheckoutSessionCompleted,
};

export async function POST(request: NextRequest) {
  try {
    // Get raw body as buffer for signature verification
    const buf = await request.arrayBuffer();
    const body = Buffer.from(buf);
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Get the config manager instance
    const stripeConfigManager = getStripeConfigManager();
    if (!stripeConfigManager) {
      return NextResponse.json(
        { error: "Stripe service is not configured" },
        { status: 503 }
      );
    }

    // Validate configuration
    const validation = await stripeConfigManager.validateConfiguration();
    if (!validation.configStatus.webhookSecret) {
      console.error('Webhook secret not properly configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature using config manager
      const config = stripeConfigManager.getConfig();
      console.log('Processing webhook with enhanced automation...');
      event = stripe.webhooks.constructEvent(body, signature, config.webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        webhookSecretConfigured: !!webhookSecret,
        signaturePresent: !!signature
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Received webhook event: ${event.type}`);

    // Use enhanced automation system for processing
    try {
      const result = await stripeAutomation.processWebhookAutomatically(event, signature, body);
      
      if (result.success) {
        console.log(`Successfully processed ${event.type} with automation`);
      } else {
        console.warn(`Automation processing failed for ${event.type}:`, result.error);
        
        // Fallback to legacy handlers if automation fails
        const handler = eventHandlers[event.type as keyof typeof eventHandlers];
        if (handler) {
          await handler(event);
          console.log(`Fallback handler succeeded for ${event.type}`);
        }
      }
    } catch (error) {
      console.error(`Error in automated webhook processing for ${event.type}:`, error);
      
      // Fallback to legacy handlers
      const handler = eventHandlers[event.type as keyof typeof eventHandlers];
      if (handler) {
        try {
          await handler(event);
          console.log(`Fallback handler succeeded for ${event.type}`);
        } catch (fallbackError) {
          console.error(`Both automation and fallback failed for ${event.type}:`, fallbackError);
          return NextResponse.json(
            { error: `Failed to handle ${event.type}` },
            { status: 500 }
          );
        }
      } else {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    // Persist the event to local JSON log for diagnostics and sync API
    await saveWebhookEvent(event);

    return NextResponse.json({ 
      received: true, 
      processed: true,
      automation: 'enhanced'
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Stripe webhook endpoint",
    status: "active",
    supportedEvents: Object.keys(eventHandlers),
    webhookSecretConfigured: !!webhookSecret,
  });
}

// Event handler functions
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  console.log('Payment succeeded:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customer: paymentIntent.customer,
  });

  // TODO: Update donation records, send thank you email, etc.
  await logDonation({
    stripePaymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100, // Convert from cents
    currency: paymentIntent.currency,
    customerId: paymentIntent.customer as string,
    status: 'completed',
    timestamp: new Date().toISOString(),
  });
}

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  console.log('Payment failed:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customer: paymentIntent.customer,
    lastPaymentError: paymentIntent.last_payment_error,
  });

  // TODO: Log failed payment, send notification, etc.
}

async function handleCustomerCreated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  
  console.log('Customer created:', {
    id: customer.id,
    email: customer.email,
    name: customer.name,
  });

  // TODO: Add to donor database, send welcome email, etc.
}

async function handleCustomerUpdated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  
  console.log('Customer updated:', {
    id: customer.id,
    email: customer.email,
    name: customer.name,
  });

  // TODO: Update donor information in database
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  
  console.log('Invoice payment succeeded:', {
    id: invoice.id,
    amount: invoice.amount_paid,
    customer: invoice.customer,
  });

  // TODO: Handle recurring donation success
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  
  console.log('Invoice payment failed:', {
    id: invoice.id,
    amount: invoice.amount_due,
    customer: invoice.customer,
  });

  // TODO: Handle recurring donation failure, send notification
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  console.log('Subscription created:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
  });

  // TODO: Set up recurring donation tracking
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  console.log('Subscription updated:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
  });

  // TODO: Update recurring donation status
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  console.log('Subscription deleted:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
  });

  // TODO: Handle subscription cancellation
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  console.log('Checkout session completed:', {
    id: session.id,
    customer: session.customer,
    paymentIntent: session.payment_intent,
    amountTotal: session.amount_total,
  });

  // TODO: Process completed checkout
}

// Helper function to log donations
async function logDonation(donation: {
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  customerId: string;
  status: string;
  timestamp: string;
}) {
  try {
    // TODO: Implement actual database logging
    console.log('Logging donation:', donation);
    
    // For now, we'll just log to console
    // In a real implementation, you would save to your database
  } catch (error) {
    console.error('Failed to log donation:', error);
  }
}

// Persist webhook events to data/logs/stripe-events.json
async function saveWebhookEvent(event: Stripe.Event) {
  try {
    const dir = path.join(process.cwd(), 'data', 'logs');
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, 'stripe-events.json');

    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [];
    } catch {
      // No existing file; start fresh
      existing = [];
    }

    const entry = {
      id: event.id,
      type: event.type,
      api_version: event.api_version,
      createdAt: new Date().toISOString(),
      data: event.data,
    };

    existing.push(entry);
    await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error('Failed to persist webhook event:', err);
  }
}