import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

interface SingleEmailRequest {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

interface BatchEmailRequest {
  emails: SingleEmailRequest[];
}

interface EmailStatusRequest {
  emailId: string;
}

interface EmailUpdateRequest {
  emailId: string;
  scheduledAt: string;
}

interface EmailCancelRequest {
  emailId: string;
}

interface ResendRequest {
  action: 'send' | 'batch' | 'status' | 'update' | 'cancel';
  data?: SingleEmailRequest | BatchEmailRequest | EmailStatusRequest | EmailUpdateRequest | EmailCancelRequest;
}

// POST - Handle all Resend email operations
export async function POST(request: NextRequest) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_demo_")) {
      console.warn("⚠️ RESEND_API_KEY not configured or using demo key");
      return NextResponse.json({
        success: false,
        error: "Email service not configured",
        isDemoMode: true,
      }, { status: 503 });
    }

    const body: ResendRequest = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'send':
        return await handleSendEmail(data as SingleEmailRequest);
      case 'batch':
        return await handleBatchSend(data as BatchEmailRequest);
      case 'status':
        return await handleGetEmailStatus(data as EmailStatusRequest);
      case 'update':
        return await handleUpdateEmail(data as EmailUpdateRequest);
      case 'cancel':
        return await handleCancelEmail(data as EmailCancelRequest);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Resend API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
      },
      { status: 500 }
    );
  }
}

// Handle single email sending
async function handleSendEmail(emailData: SingleEmailRequest) {
  try {
    // Set default from email if not provided
    const fromEmail = emailData.from || process.env.RESEND_FROM_EMAIL || 'noreply@familyreliefproject7.org';
    
    // Ensure we have at least text content
    const emailContent = {
      html: emailData.html,
      text: emailData.text || emailData.subject || 'No content provided'
    };

    const result = await resend.emails.send({
      from: fromEmail,
      to: emailData.to,
      subject: emailData.subject,
      ...emailContent,
      cc: emailData.cc,
      bcc: emailData.bcc,
      replyTo: emailData.replyTo,
      tags: emailData.tags || [
        { name: 'source', value: 'admin_dashboard' },
        { name: 'type', value: 'single_email' }
      ]
    });

    console.log('✅ Single email sent successfully:', result.data?.id);

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
      message: 'Email sent successfully',
      recipients: emailData.to.length
    });
  } catch (error) {
    console.error('❌ Failed to send single email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle batch email sending
async function handleBatchSend(batchData: BatchEmailRequest) {
  try {
    const emailsToSend = batchData.emails.map(email => {
      const emailContent = {
        html: email.html,
        text: email.text || email.subject || 'No content provided'
      };

      return {
        from: email.from || process.env.RESEND_FROM_EMAIL || 'noreply@familyreliefproject7.org',
        to: email.to,
        subject: email.subject,
        ...emailContent,
        cc: email.cc,
        bcc: email.bcc,
        replyTo: email.replyTo,
        tags: email.tags || [
          { name: 'source', value: 'admin_dashboard' },
          { name: 'type', value: 'batch_email' }
        ]
      };
    });

    const result = await resend.batch.send(emailsToSend);

    console.log('✅ Batch emails sent successfully:', Array.isArray(result.data) ? result.data.length : 0, 'emails');

    return NextResponse.json({
      success: true,
      batchId: Array.isArray(result.data) && result.data.length > 0 ? result.data[0].id : undefined,
      emailIds: Array.isArray(result.data) ? result.data.map(email => email.id) : [],
      message: 'Batch emails sent successfully',
      totalEmails: emailsToSend.length,
      successfulEmails: Array.isArray(result.data) ? result.data.length : 0
    });
  } catch (error) {
    console.error('❌ Failed to send batch emails:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send batch emails',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle email status retrieval
async function handleGetEmailStatus(statusData: EmailStatusRequest) {
  try {
    const result = await resend.emails.get(statusData.emailId);

    console.log('✅ Email status retrieved:', statusData.emailId);

    return NextResponse.json({
      success: true,
      emailId: statusData.emailId,
      status: result,
      message: 'Email status retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Failed to get email status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve email status',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle email update (reschedule)
async function handleUpdateEmail(updateData: EmailUpdateRequest) {
  try {
    const result = await resend.emails.update({
      id: updateData.emailId,
      scheduledAt: updateData.scheduledAt
    });

    console.log('✅ Email updated successfully:', updateData.emailId);

    return NextResponse.json({
      success: true,
      emailId: updateData.emailId,
      scheduledAt: updateData.scheduledAt,
      result: result,
      message: 'Email updated successfully'
    });
  } catch (error) {
    console.error('❌ Failed to update email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update email',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle email cancellation
async function handleCancelEmail(cancelData: EmailCancelRequest) {
  try {
    const result = await resend.emails.cancel(cancelData.emailId);

    console.log('✅ Email cancelled successfully:', cancelData.emailId);

    return NextResponse.json({
      success: true,
      emailId: cancelData.emailId,
      result: result,
      message: 'Email cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Failed to cancel email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel email',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve email information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const emailId = searchParams.get('emailId');

    if (action === 'status' && emailId) {
      return await handleGetEmailStatus({ emailId });
    }

    return NextResponse.json({ error: 'Invalid GET request parameters' }, { status: 400 });
  } catch (error) {
    console.error('Resend GET API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
      },
      { status: 500 }
    );
  }
}