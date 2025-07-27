'use client';

import { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth, WithPermission } from '../../_components/AdminAuth';
import Link from 'next/link';
import { volunteerStorage } from '@/lib/volunteerStorage';
import type { Volunteer, VolunteerFilters, VolunteerProgram } from '@/types/volunteer';
import VolunteerDashboard from '../../_components/VolunteerDashboard';

function VolunteersContent() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'list'>('dashboard');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [programs, setPrograms] = useState<VolunteerProgram[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [filters, setFilters] = useState<VolunteerFilters>({
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [volunteersData, programsData] = await Promise.all([
        volunteerStorage.getAllVolunteers(filters),
        volunteerStorage.getAllPrograms()
      ]);
      setVolunteers(volunteersData);
      setPrograms(programsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFilterChange = (key: keyof VolunteerFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectAll = () => {
    if (selectedVolunteers.length === volunteers.length) {
      setSelectedVolunteers([]);
    } else {
      setSelectedVolunteers(volunteers.map(v => v.id));
    }
  };

  const handleSelectVolunteer = (volunteerId: string) => {
    setSelectedVolunteers(prev =>
      prev.includes(volunteerId)
        ? prev.filter(id => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedVolunteers.length === 0) return;

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedVolunteers.length} volunteers?`)) {
      return;
    }

    try {
      switch (action) {
        case 'activate':
          await volunteerStorage.bulkUpdateVolunteerStatus(selectedVolunteers, 'active');
          break;
        case 'deactivate':
          await volunteerStorage.bulkUpdateVolunteerStatus(selectedVolunteers, 'inactive');
          break;
        case 'delete':
          for (const id of selectedVolunteers) {
            await volunteerStorage.deleteVolunteer(id);
          }
          break;
      }
      await loadData();
      setSelectedVolunteers([]);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const getStatusBadge = (status: Volunteer['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      on_leave: 'bg-blue-100 text-blue-800'
    };

    return badges[status];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading volunteers...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access volunteer management.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <WithPermission
      permission="manage_volunteers"
      fallback={
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-700">
                You do not have permission to manage volunteers. Contact an administrator for access.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Volunteer Management</h1>
              <p className="text-gray-600">Manage volunteers, schedules, and training programs</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Volunteer List
            </button>
          </div>

          {/* Dashboard View */}
          {activeView === 'dashboard' && <VolunteerDashboard />}

          {/* List View */}
          {activeView === 'list' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>

                  {/* Program Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      onChange={(e) => handleFilterChange('programs', e.target.value ? [e.target.value] : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Programs</option>
                      {programs.map(program => (
                        <option key={program.id} value={program.id}>{program.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value as VolunteerFilters['sortBy'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="name">Name</option>
                      <option value="joinDate">Join Date</option>
                      <option value="totalHours">Total Hours</option>
                      <option value="lastActive">Last Active</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search volunteers..."
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasTransportation === true}
                      onChange={(e) => handleFilterChange('hasTransportation', e.target.checked ? true : undefined)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">Has Transportation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.backgroundCheckCompleted === true}
                      onChange={(e) => handleFilterChange('backgroundCheckCompleted', e.target.checked ? true : undefined)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">Background Check Completed</span>
                  </label>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedVolunteers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-900 font-medium">
                      {selectedVolunteers.length} volunteer{selectedVolunteers.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBulkAction('activate')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleBulkAction('deactivate')}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        Deactivate
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Volunteers List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoadingData ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading volunteers...</p>
                  </div>
                ) : volunteers.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first volunteer.</p>
                    <Link
                      href="/admin/volunteers/add"
                      className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Volunteer
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left">
                              <input
                                type="checkbox"
                                checked={selectedVolunteers.length === volunteers.length}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Programs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hours
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {volunteers.map((volunteer) => (
                            <tr key={volunteer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedVolunteers.includes(volunteer.id)}
                                  onChange={() => handleSelectVolunteer(volunteer.id)}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {volunteer.firstName} {volunteer.lastName}
                                  </div>
                                  {volunteer.languages.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      Languages: {volunteer.languages.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{volunteer.email}</div>
                                <div className="text-sm text-gray-500">{volunteer.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(volunteer.status)}`}>
                                  {volunteer.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {volunteer.preferredPrograms.length} programs
                                </div>
                                {volunteer.skills.length > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {volunteer.skills.slice(0, 3).map(s => s.name).join(', ')}
                                    {volunteer.skills.length > 3 && ` +${volunteer.skills.length - 3} more`}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {volunteer.totalHours} hrs / {volunteer.totalShifts} shifts
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(volunteer.joinDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                  href={`/admin/volunteers/${volunteer.id}`}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  View
                                </Link>
                                <Link
                                  href={`/admin/volunteers/${volunteer.id}/edit`}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Edit
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                      {volunteers.map((volunteer) => (
                        <div key={volunteer.id} className="p-4 border-b border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                checked={selectedVolunteers.includes(volunteer.id)}
                                onChange={() => handleSelectVolunteer(volunteer.id)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 mt-1 mr-3"
                              />
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {volunteer.firstName} {volunteer.lastName}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{volunteer.email}</p>
                                <p className="text-sm text-gray-500">{volunteer.phone}</p>
                              </div>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(volunteer.status)}`}>
                              {volunteer.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {volunteer.totalHours} hours • {volunteer.totalShifts} shifts • Joined {new Date(volunteer.joinDate).toLocaleDateString()}
                          </div>
                          <div className="flex justify-end gap-3">
                            <Link
                              href={`/admin/volunteers/${volunteer.id}`}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/volunteers/${volunteer.id}/edit`}
                              className="text-green-600 hover:text-green-900 text-sm"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </WithPermission>
  );
}

export default function VolunteersPage() {
  return (
    <AdminAuthProvider>
      <VolunteersContent />
    </AdminAuthProvider>
  );
}
