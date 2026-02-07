import Stripe from "stripe";

(async () => {
  console.log("Initializing Stripe...");
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-01-27.acacia" as any,
      typescript: true,
    });
    console.log("Stripe initialized successfully");
    try {
      await stripe.balance.retrieve();
    } catch (e: any) {
      console.log("Balance retrieve failed (expected with fake key):", e.message);
    }
  } catch (error) {
    console.error("Error initializing Stripe:", error);
  }
})();
