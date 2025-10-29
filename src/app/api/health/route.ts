import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        stripe: {
          testMode: process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true',
          configured: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
        },
        email: {
          configured: !!process.env.RESEND_API_KEY,
          provider: process.env.RESEND_API_KEY ? 'resend' : 'none'
        },
        database: {
          status: 'operational' // File-based storage
        }
      },
      uptime: process.uptime(),
      version: '1.0.0'
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}