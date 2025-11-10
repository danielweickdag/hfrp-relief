import type { StripeAutomatedDonation } from './stripeAutomatedDonationSystem';

export interface TaxReceiptData {
  donationId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  donationDate: string;
  taxYear: number;
  receiptNumber: string;
  organizationName: string;
  organizationAddress: string;
  organizationTaxId: string;
  taxExemptStatus: string;
  isRecurring: boolean;
  campaignName?: string;
}

export class TaxReceiptGenerator {
  private organizationName: string;
  private organizationAddress: string;
  private organizationTaxId: string;
  private taxExemptStatus: string;

  constructor() {
    this.organizationName = process.env.STRIPE_TAX_ORGANIZATION_NAME || "HFRP Relief";
    this.organizationAddress = `${process.env.STRIPE_TAX_BUSINESS_ADDRESS_LINE1 || ""}, ${process.env.STRIPE_TAX_BUSINESS_CITY || ""}, ${process.env.STRIPE_TAX_BUSINESS_STATE || ""} ${process.env.STRIPE_TAX_BUSINESS_POSTAL_CODE || ""}`.trim();
    this.organizationTaxId = process.env.STRIPE_TAX_ORGANIZATION_TAX_ID || "";
    this.taxExemptStatus = process.env.STRIPE_TAX_EXEMPT_STATUS || "501(c)(3)";
  }

  generateReceiptData(donation: StripeAutomatedDonation, donorEmail?: string): TaxReceiptData {
    const receiptNumber = `TR-${donation.id}-${Date.now()}`;
    const donationDate = new Date(donation.createdAt);
    const taxYear = donationDate.getFullYear();

    return {
      donationId: donation.id,
      donorName: donation.donorName || "Anonymous Donor",
      donorEmail: donorEmail || "donor@example.com", // Email needs to be provided separately
      amount: donation.amount,
      currency: donation.currency,
      donationDate: donation.createdAt,
      taxYear,
      receiptNumber,
      organizationName: this.organizationName,
      organizationAddress: this.organizationAddress,
      organizationTaxId: this.organizationTaxId,
      taxExemptStatus: this.taxExemptStatus,
      isRecurring: donation.type === "monthly" || donation.type === "quarterly" || donation.type === "annual",
      campaignName: donation.campaignId,
    };
  }

  generateHtmlReceipt(receiptData: TaxReceiptData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Receipt - ${receiptData.receiptNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .organization-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .receipt-title {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            color: #1f2937;
        }
        .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }
        .info-section {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
        }
        .info-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
        }
        .amount-section {
            text-align: center;
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .amount {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
        }
        .tax-info {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="organization-name">${receiptData.organizationName}</div>
        <div>${receiptData.organizationAddress}</div>
        <div>Tax ID: ${receiptData.organizationTaxId}</div>
        <div>${receiptData.taxExemptStatus} Organization</div>
    </div>

    <div class="receipt-title">Official Tax Receipt</div>

    <div class="receipt-info">
        <div class="info-section">
            <div class="info-label">Receipt Number:</div>
            <div>${receiptData.receiptNumber}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Date of Donation:</div>
            <div>${new Date(receiptData.donationDate).toLocaleDateString()}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Donor Name:</div>
            <div>${receiptData.donorName}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Tax Year:</div>
            <div>${receiptData.taxYear}</div>
        </div>
    </div>

    <div class="amount-section">
        <div>Total Tax-Deductible Amount</div>
        <div class="amount">$${receiptData.amount.toFixed(2)} ${receiptData.currency.toUpperCase()}</div>
        ${receiptData.isRecurring ? '<div style="margin-top: 10px; font-size: 14px;">Recurring Donation</div>' : ''}
        ${receiptData.campaignName ? `<div style="margin-top: 10px; font-size: 14px;">Campaign: ${receiptData.campaignName}</div>` : ''}
    </div>

    <div class="tax-info">
        <strong>Important Tax Information:</strong><br>
        This receipt acknowledges your charitable contribution to ${receiptData.organizationName}, 
        a ${receiptData.taxExemptStatus} tax-exempt organization. No goods or services were provided 
        in exchange for this contribution. Please consult your tax advisor regarding the deductibility 
        of this donation.
    </div>

    <div class="footer">
        <p>This receipt was generated electronically and is valid for tax purposes.</p>
        <p>If you have any questions about this receipt, please contact us.</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`;
  }

  generateTextReceipt(receiptData: TaxReceiptData): string {
    return `
TAX RECEIPT
===========

${receiptData.organizationName}
${receiptData.organizationAddress}
Tax ID: ${receiptData.organizationTaxId}
${receiptData.taxExemptStatus} Organization

Receipt Number: ${receiptData.receiptNumber}
Date of Donation: ${new Date(receiptData.donationDate).toLocaleDateString()}
Donor Name: ${receiptData.donorName}
Tax Year: ${receiptData.taxYear}

DONATION DETAILS
================
Amount: $${receiptData.amount.toFixed(2)} ${receiptData.currency.toUpperCase()}
Type: ${receiptData.isRecurring ? 'Recurring Donation' : 'One-time Donation'}
${receiptData.campaignName ? `Campaign: ${receiptData.campaignName}` : ''}

TAX INFORMATION
===============
This receipt acknowledges your charitable contribution to ${receiptData.organizationName}, 
a ${receiptData.taxExemptStatus} tax-exempt organization. No goods or services were provided 
in exchange for this contribution. Please consult your tax advisor regarding the 
deductibility of this donation.

This receipt was generated electronically and is valid for tax purposes.
Generated on: ${new Date().toLocaleDateString()}

If you have any questions about this receipt, please contact us.
`;
  }

  async generateAndSaveReceipt(
    donation: StripeAutomatedDonation, 
    donorEmail: string,
    format: 'html' | 'text' = 'html'
  ): Promise<{ receiptData: TaxReceiptData; content: string }> {
    const receiptData = this.generateReceiptData(donation, donorEmail);
    const content = format === 'html' 
      ? this.generateHtmlReceipt(receiptData)
      : this.generateTextReceipt(receiptData);

    // In a real implementation, you might save this to a file system or database
    // For now, we'll just return the content
    
    return {
      receiptData,
      content
    };
  }
}

// Export a singleton instance
export const taxReceiptGenerator = new TaxReceiptGenerator();