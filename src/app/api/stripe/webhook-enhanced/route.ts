import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripeEnhanced } from "@/lib/stripeEnhanced";
import { stripeAutomatedDonationSystem } from "@/lib/stripeAutomatedDonationSystem";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Process the webhook event with both systems
    const [legacyResult, automatedResult] = await Promise.all([
      stripeEnhanced.processWebhook(event, signature).catch((err) => {
        console.error("Legacy webhook processing failed:", err);
        return null;
      }),
      stripeAutomatedDonationSystem.processWebhookEvent(event).catch((err) => {
        console.error("Automated webhook processing failed:", err);
        return null;
      }),
    ]);

    // Log successful webhook processing
    console.log(`✅ Webhook processed: ${event.type} - ${event.id}`);

    // Enhanced logging for different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("🎉 Payment successful:", {
          sessionId: session.id,
          amountTotal: session.amount_total,
          customerEmail: session.customer_details?.email,
          campaignId: session.metadata?.campaignId,
          mode: session.mode,
          metadata: session.metadata,
        });

        // Trigger immediate automation for successful checkouts
        if (session.metadata?.campaignId) {
          console.log(
            `🚀 Triggering automation for campaign: ${session.metadata.campaignId}`
          );
        }
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("💳 Payment intent succeeded:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          campaignId: paymentIntent.metadata?.campaignId,
          metadata: paymentIntent.metadata,
        });
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log("❌ Payment failed:", {
          paymentIntentId: failedPayment.id,
          amount: failedPayment.amount,
          campaignId: failedPayment.metadata?.campaignId,
          lastPaymentError: failedPayment.last_payment_error,
        });
        break;

      case "customer.subscription.created":
        const newSubscription = event.data.object as Stripe.Subscription;
        console.log("🔄 New subscription created:", {
          subscriptionId: newSubscription.id,
          customerId: newSubscription.customer,
          status: newSubscription.status,
          amount: newSubscription.items.data[0]?.price.unit_amount,
          interval: newSubscription.items.data[0]?.price.recurring?.interval,
          campaignId: newSubscription.metadata?.campaignId,
          metadata: newSubscription.metadata,
        });
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log("🔄 Subscription updated:", {
          subscriptionId: updatedSubscription.id,
          customerId: updatedSubscription.customer,
          status: updatedSubscription.status,
          campaignId: updatedSubscription.metadata?.campaignId,
          metadata: updatedSubscription.metadata,
        });
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription cancelled:", {
          subscriptionId: deletedSubscription.id,
          customerId: deletedSubscription.customer,
          cancelledAt: deletedSubscription.canceled_at,
          campaignId: deletedSubscription.metadata?.campaignId,
          cancellationReason: deletedSubscription.cancellation_details?.reason,
        });
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        console.log("💰 Recurring payment succeeded:", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription as string,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
          campaignId: invoice.lines.data[0]?.metadata?.campaignId,
          billingReason: invoice.billing_reason,
        });
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log("❌ Recurring payment failed:", {
          invoiceId: failedInvoice.id,
          subscriptionId: failedInvoice.subscription as string,
          customerId: failedInvoice.customer,
          amountDue: failedInvoice.amount_due,
          attemptCount: failedInvoice.attempt_count,
          nextPaymentAttempt: failedInvoice.next_payment_attempt,
        });
        break;

      case "customer.created":
        const customer = event.data.object as Stripe.Customer;
        console.log("👤 New customer created:", {
          customerId: customer.id,
          email: customer.email,
          name: customer.name,
          metadata: customer.metadata,
        });
        break;

      case "charge.dispute.created":
        const dispute = event.data.object as Stripe.Dispute;
        console.log("⚠️ Payment dispute created:", {
          disputeId: dispute.id,
          chargeId: dispute.charge,
          amount: dispute.amount,
          reason: dispute.reason,
          status: dispute.status,
        });
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Return success response with processing details
    return NextResponse.json({
      received: true,
      processed: true,
      eventType: event.type,
      eventId: event.id,
      legacyProcessed: !!legacyResult,
      automatedProcessed: !!automatedResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
