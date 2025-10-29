"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  UserPlus, 
  UserMinus, 
  Mail, 
  Phone, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: "hope" | "relief" | "transformation";
  billingCycle: "monthly" | "annual";
  status: "active" | "inactive" | "cancelled";
  joinDate: string;
  lastPayment?: string;
  preferences: {
    emailUpdates: boolean;
    smsUpdates: boolean;
    newsletter: boolean;
    prayerRequests: boolean;
    impactReports: boolean;
  };
  impactTracking: {
    totalContributed: number;
    familiesHelped: number;
    mealsProvided: number;
    programsSupported: string[];
  };
}

interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  membersByType: {
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
  };
}

export default function MembershipDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<MembershipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setRefreshing(true);
      
      // Load members
      const membersResponse = await fetch("/api/membership");
      const membersData = await membersResponse.json();
      
      // Load stats
      const statsResponse = await fetch("/api/membership?action=stats");
      const statsData = await statsResponse.json();
      
      if (membersData.success) {
        setMembers(membersData.members);
      }
      
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Failed to load membership data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesType = typeFilter === "all" || member.membershipType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Export members data
  const exportData = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Type", "Billing", "Status", "Join Date"],
      ...filteredMembers.map(member => [
        `${member.firstName} ${member.lastName}`,
        member.email,
        member.phone || "",
        member.membershipType,
        member.billingCycle,
        member.status,
        new Date(member.joinDate).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `membership-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100";
      case "inactive": return "text-yellow-600 bg-yellow-100";
      case "cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "hope": return "text-blue-600 bg-blue-100";
      case "relief": return "text-green-600 bg-green-100";
      case "transformation": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading membership dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relief Partnership Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor our community of relief partners and their impact</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Partners</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Partners</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Support</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Partners</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentJoins}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impact Metrics */}
        {stats && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Relief Impact Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.impactMetrics?.totalFamiliesHelped || 0}</div>
                <div className="text-sm text-gray-600">Families Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.impactMetrics?.totalMealsProvided || 0}</div>
                <div className="text-sm text-gray-600">Meals Provided</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">${stats.impactMetrics?.totalContributions || 0}</div>
                <div className="text-sm text-gray-600">Total Contributions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.impactMetrics?.activePrograms || 0}</div>
                <div className="text-sm text-gray-600">Active Programs</div>
              </div>
            </div>
          </div>
        )}

        {/* Membership Type Breakdown */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Partnership Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.membersByType.hope}</div>
                <div className="text-sm text-gray-600">Hope Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.membersByType.relief}</div>
                <div className="text-sm text-gray-600">Relief Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.membersByType.transformation}</div>
                <div className="text-sm text-gray-600">Transformation Partners</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="hope">Hope Partners</option>
              <option value="relief">Relief Partners</option>
              <option value="transformation">Transformation Partners</option>
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredMembers.length} of {members.length} members
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Relief Partners</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partnership Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{member.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {member.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(member.membershipType)}`}>
                        {member.membershipType === 'hope' ? 'Hope Partner' :
                         member.membershipType === 'relief' ? 'Relief Partner' :
                         'Transformation Partner'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {member.billingCycle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowMemberModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No members found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Member Detail Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Member Details</h3>
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.lastName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.email}</p>
                </div>
                
                {selectedMember.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.phone}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Membership Type</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedMember.membershipType)}`}>
                      {selectedMember.membershipType}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.billingCycle}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMember.status)}`}>
                    {selectedMember.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Join Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedMember.joinDate).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Communication Preferences</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {selectedMember.preferences.emailUpdates ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-900">Email Updates</span>
                    </div>
                    <div className="flex items-center">
                      {selectedMember.preferences.smsUpdates ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-900">SMS Updates</span>
                    </div>
                    <div className="flex items-center">
                      {selectedMember.preferences.newsletter ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-900">Newsletter</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}