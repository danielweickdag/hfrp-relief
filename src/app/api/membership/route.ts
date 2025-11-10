import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: "community" | "hope" | "relief" | "transformation"; // Added community type for free membership
  billingCycle: "free" | "monthly" | "annual"; // Added free option
  status: "active" | "inactive" | "cancelled";
  joinDate: string;
  lastPayment?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  interests: {
    emergencyUpdates: boolean;
    volunteerOpportunities: boolean;
    newsletter: boolean;
    eventNotifications: boolean;
    impactReports: boolean;
  };
  volunteerAreas: string[];
  availability?: string;
  impactTracking: {
    totalContributed: number;
    familiesHelped: number;
    mealsProvided: number;
    programsSupported: string[];
    volunteerHours?: number;
    eventsAttended?: number;
  };
  metadata?: Record<string, string | number | boolean>;
}

interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  membersByType: {
    community: number;
    hope: number;
    relief: number;
    transformation: number;
  };
  monthlyRevenue: number;
  annualRevenue: number;
  recentJoins: number;
  churnRate: number;
  impactMetrics: {
    totalFamiliesHelped: number;
    totalMealsProvided: number;
    totalContributions: number;
    activePrograms: number;
    totalVolunteers: number;
    totalVolunteerHours: number;
  };
}

const MEMBERS_FILE = path.join(process.cwd(), "data", "members.json");
const ACTIVITY_LOG_FILE = path.join(process.cwd(), "data", "membership-activity.json");

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load members from file
async function loadMembers(): Promise<Member[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(MEMBERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save members to file
async function saveMembers(members: Member[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2));
}

// Log membership activity
async function logMembershipActivity(
  action: string,
  memberId: string,
  activity: Record<string, string | number | boolean>
): Promise<void> {
  try {
    await ensureDataDirectory();
    let logs: Array<Record<string, string | number | boolean>> = [];
    try {
      const data = await fs.readFile(ACTIVITY_LOG_FILE, "utf-8");
      logs = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty array
    }

    logs.push({
      timestamp: new Date().toISOString(),
      action,
      memberId,
      ...activity,
    });

    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    await fs.writeFile(ACTIVITY_LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error("Failed to log membership activity:", error);
  }
}

// Send welcome email
async function sendWelcomeEmail(member: Member): Promise<void> {
  try {
    const emailData = {
      to: member.email,
      subject: "Welcome to the Haitian Family Relief Project!",
      template: "membership_welcome",
      data: {
        firstName: member.firstName,
        lastName: member.lastName,
        membershipType: member.membershipType,
        billingCycle: member.billingCycle,
        joinDate: new Date(member.joinDate).toLocaleDateString(),
      },
    };

    // Send email via existing email API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005'}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      console.error("Failed to send welcome email:", await response.text());
    }
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

// Generate membership statistics
function generateStats(members: Member[]): MembershipStats {
  const activeMembers = members.filter(m => m.status === "active");
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentJoins = members.filter(m => new Date(m.joinDate) > thirtyDaysAgo).length;
  const cancelledMembers = members.filter(m => m.status === "cancelled").length;
  const churnRate = members.length > 0 ? (cancelledMembers / members.length) * 100 : 0;
  
  const membersByType = {
    community: activeMembers.filter(m => m.membershipType === "community").length,
    hope: activeMembers.filter(m => m.membershipType === "hope").length,
    relief: activeMembers.filter(m => m.membershipType === "relief").length,
    transformation: activeMembers.filter(m => m.membershipType === "transformation").length,
  };

  // Calculate revenue based on membership plans (community is free)
  const monthlyRevenue = activeMembers.reduce((total, member) => {
    if (member.membershipType === "community") return total; // Free membership
    const amounts = {
      hope: member.billingCycle === "monthly" ? 15 : 162 / 12,
      relief: member.billingCycle === "monthly" ? 35 : 378 / 12,
      transformation: member.billingCycle === "monthly" ? 75 : 810 / 12,
    };
    return total + (amounts[member.membershipType as keyof typeof amounts] || 0);
  }, 0);

  // Calculate impact metrics
  const impactMetrics = {
    totalFamiliesHelped: members.reduce((sum, member) => sum + (member.impactTracking?.familiesHelped || 0), 0),
    totalMealsProvided: members.reduce((sum, member) => sum + (member.impactTracking?.mealsProvided || 0), 0),
    totalContributions: members.reduce((sum, member) => sum + (member.impactTracking?.totalContributed || 0), 0),
    activePrograms: 8, // Static for now - would be dynamic based on actual programs
    totalVolunteers: activeMembers.filter(m => m.volunteerAreas && m.volunteerAreas.length > 0).length,
    totalVolunteerHours: members.reduce((sum, member) => sum + (member.impactTracking?.volunteerHours || 0), 0),
  };

  return {
    totalMembers: members.length,
    activeMembers: activeMembers.length,
    membersByType,
    monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    annualRevenue: Math.round(monthlyRevenue * 12 * 100) / 100,
    recentJoins,
    churnRate: Math.round(churnRate * 100) / 100,
    impactMetrics,
  };
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// GET - Retrieve members or stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    const members = await loadMembers();

    if (action === "stats") {
      const stats = generateStats(members);
      return NextResponse.json({ success: true, stats });
    }

    // Return paginated members
    const paginatedMembers = members.slice(offset, offset + limit);
    return NextResponse.json({ 
      success: true, 
      members: paginatedMembers,
      total: members.length,
      limit,
      offset
    });
  } catch (error) {
    console.error("GET /api/membership error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve membership data" },
      { status: 500 }
    );
  }
}

// POST - Create new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      membershipType,
      billingCycle,
      interests,
      volunteerAreas,
      availability,
      emailUpdates,
      smsUpdates,
      newsletter,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !membershipType || !billingCycle) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate membership type
    if (!["community", "hope", "relief", "transformation"].includes(membershipType)) {
      return NextResponse.json(
        { success: false, error: "Invalid membership type" },
        { status: 400 }
      );
    }

    // Validate billing cycle
    if (!["free", "monthly", "annual"].includes(billingCycle)) {
      return NextResponse.json(
        { success: false, error: "Invalid billing cycle" },
        { status: 400 }
      );
    }

    const members = await loadMembers();

    // Check if email already exists
    const existingMember = members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create new member
    const newMember: Member = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || undefined,
      membershipType,
      billingCycle,
      status: "active",
      joinDate: new Date().toISOString(),
      interests: {
        emergencyUpdates: emailUpdates !== undefined ? emailUpdates : true,
        volunteerOpportunities: true,
        newsletter: newsletter !== undefined ? newsletter : true,
        eventNotifications: emailUpdates !== undefined ? emailUpdates : true,
        impactReports: true,
      },
      volunteerAreas: volunteerAreas || [],
      availability: availability || "weekends",
      impactTracking: {
        totalContributed: 0,
        familiesHelped: 0,
        mealsProvided: 0,
        programsSupported: [],
        volunteerHours: 0,
        eventsAttended: 0,
      },
      metadata: {
        source: "website",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    };

    members.push(newMember);
    await saveMembers(members);

    // Log the activity
    await logMembershipActivity("member_created", newMember.id, {
      membershipType,
      billingCycle,
      email: newMember.email,
      source: "website",
    });

    // Send welcome email (async, don't wait for completion)
    sendWelcomeEmail(newMember).catch(error => {
      console.error("Failed to send welcome email:", error);
    });

    return NextResponse.json({
      success: true,
      member: {
        id: newMember.id,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        membershipType: newMember.membershipType,
        billingCycle: newMember.billingCycle,
        joinDate: newMember.joinDate,
      },
      message: "Membership created successfully! Welcome email sent.",
    });
  } catch (error) {
    console.error("POST /api/membership error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create membership" },
      { status: 500 }
    );
  }
}

// PUT - Update existing member
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Member ID is required" },
        { status: 400 }
      );
    }

    const members = await loadMembers();
    const memberIndex = members.findIndex(m => m.id === id);

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    // Validate email if being updated
    if (updates.email && !isValidEmail(updates.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check for email conflicts if email is being updated
    if (updates.email && updates.email.toLowerCase() !== members[memberIndex].email.toLowerCase()) {
      const emailExists = members.some(m => m.email.toLowerCase() === updates.email.toLowerCase() && m.id !== id);
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // Update member
    const updatedMember = { 
      ...members[memberIndex], 
      ...updates,
      email: updates.email ? updates.email.toLowerCase().trim() : members[memberIndex].email
    };
    members[memberIndex] = updatedMember;
    await saveMembers(members);

    // Log the activity
    await logMembershipActivity("member_updated", id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      member: {
        id: updatedMember.id,
        firstName: updatedMember.firstName,
        lastName: updatedMember.lastName,
        email: updatedMember.email,
        membershipType: updatedMember.membershipType,
        billingCycle: updatedMember.billingCycle,
        status: updatedMember.status,
      },
      message: "Member updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/membership error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/deactivate member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const reason = searchParams.get("reason") || "user_request";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Member ID is required" },
        { status: 400 }
      );
    }

    const members = await loadMembers();
    const memberIndex = members.findIndex(m => m.id === id);

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    // Mark as cancelled instead of deleting
    members[memberIndex].status = "cancelled";
    members[memberIndex].metadata = {
      ...members[memberIndex].metadata,
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
    };
    
    await saveMembers(members);

    // Log the activity
    await logMembershipActivity("member_cancelled", id, {
      reason,
      cancelledAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Membership cancelled successfully",
    });
  } catch (error) {
    console.error("DELETE /api/membership error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel membership" },
      { status: 500 }
    );
  }
}