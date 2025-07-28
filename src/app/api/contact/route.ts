import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    // Initialize Resend inside the function to avoid build-time errors
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      );
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();
    const { name, email, phone, subject, message, inquiryType, newsletter } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Prepare email content
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@haitianfamilyrelief.org';
    const toEmail = process.env.RESEND_TO_EMAIL || 'contact@haitianfamilyrelief.org';

    const inquiryTypeLabels = {
      general: 'General Inquiry',
      volunteer: 'Volunteer Opportunities',
      donate: 'Donation Questions',
      media: 'Media & Press'
    };

    const emailHTML = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0;">Haitian Family Relief Project</p>
        </div>

        <div style="padding: 30px; background: white;">
          <h2 style="color: #667eea; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Contact Details</h2>

          <div style="margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 12px 0;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold;">Email:</td>
                <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #667eea;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 12px 0;">${phone}</td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold;">Inquiry Type:</td>
                <td style="padding: 12px 0;">${inquiryTypeLabels[inquiryType as keyof typeof inquiryTypeLabels] || inquiryType}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold;">Newsletter:</td>
                <td style="padding: 12px 0;">${newsletter ? 'Yes, wants to receive updates' : 'No'}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #667eea; margin-top: 30px;">Subject</h3>
          <p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 10px 0;">${subject}</p>

          <h3 style="color: #667eea; margin-top: 30px;">Message</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This message was sent via the HFRP website contact form<br>
            <strong>Reply directly to this email to respond to ${name}</strong>
          </p>
        </div>
      </div>
    `;

    const emailText = `
New Contact Form Submission - Haitian Family Relief Project

Contact Details:
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Inquiry Type: ${inquiryTypeLabels[inquiryType as keyof typeof inquiryTypeLabels] || inquiryType}
Newsletter Signup: ${newsletter ? 'Yes' : 'No'}

Subject: ${subject}

Message:
${message}

---
This message was sent via the HFRP website contact form.
Reply directly to this email to respond to ${name}.
    `;

    // Send email using Resend
    const emailData = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email, // Allow direct reply to the sender
      subject: `HFRP Contact Form: ${subject}`,
      html: emailHTML,
      text: emailText,
      tags: [
        { name: 'source', value: 'website_contact_form' },
        { name: 'inquiry_type', value: inquiryType },
        { name: 'newsletter_signup', value: newsletter ? 'yes' : 'no' }
      ]
    });

    console.log('✅ Contact form email sent successfully:', emailData.data?.id || 'sent');

    // Track analytics
    console.log('📊 Contact form submission:', {
      inquiryType,
      newsletter,
      hasPhone: !!phone,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      id: emailData.data?.id || 'sent'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);

    return NextResponse.json(
      {
        error: 'Failed to send message. Please try again or contact us directly.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
