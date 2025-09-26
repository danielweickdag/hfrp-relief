import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

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

    if (!webhookSecret) {
      console.error('Missing webhook secret');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      console.log('Webhook secret length:', webhookSecret.length);
      console.log('Signature:', signature);
      console.log('Body length:', body.length);
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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

    // Handle the event
    const handler = eventHandlers[event.type as keyof typeof eventHandlers];
    if (handler) {
      try {
        await handler(event);
        console.log(`Successfully handled ${event.type}`);
      } catch (error) {
        console.error(`Error handling ${event.type}:`, error);
        return NextResponse.json(
          { error: `Failed to handle ${event.type}` },
          { status: 500 }
        );
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
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
    subscription: invoice.subscription,
  });

  // TODO: Handle recurring donation success
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  
  console.log('Invoice payment failed:', {
    id: invoice.id,
    amount: invoice.amount_due,
    customer: invoice.customer,
    subscription: invoice.subscription,
  });

  // TODO: Handle recurring donation failure, send notification
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  console.log('Subscription created:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
  });

  // TODO: Set up recurring donation tracking
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  console.log('Subscription updated:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
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