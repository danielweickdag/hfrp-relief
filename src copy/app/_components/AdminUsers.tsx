'use client';

import { useState } from 'react';
import { useAdminAuth, WithPermission } from './AdminAuth';

interface UserFormData {
  email: string;
  name: string;
  role: 'superadmin' | 'editor' | 'volunteer';
  isActive: boolean;
}

export default function AdminUsers() {
  const { user } = useAdminAuth();
  const [users, setUsers] = useState([
    {
      id: '1',
      email: 'w.regis@comcast.net',
      name: 'Wilson Regis',
      role: 'superadmin',
      lastLogin: '2023-06-15T10:30:00Z',
      isActive: true
    },
    {
      id: '2',
      email: 'editor@haitianfamilyrelief.org',
      name: 'HFRP Editor',
      role: 'editor',
      lastLogin: '2023-06-10T14:45:00Z',
      isActive: true
    },
    {
      id: '3',
      email: 'volunteer@haitianfamilyrelief.org',
      name: 'HFRP Volunteer',
      role: 'volunteer',
      lastLogin: '2023-05-28T09:15:00Z',
      isActive: true
    },
    {
      id: '4',
      email: 'inactive@haitianfamilyrelief.org',
      name: 'Inactive User',
      role: 'volunteer',
      lastLogin: '2023-03-15T11:20:00Z',
      isActive: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'volunteer',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const validateForm = () => {
    const errors: Partial<UserFormData> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when typing
    if (formErrors[name as keyof UserFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingUserId) {
      // Update existing user
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === editingUserId
            ? {
                ...u,
                email: formData.email,
                name: formData.name,
                role: formData.role,
                isActive: formData.isActive
              }
            : u
        )
      );
      setEditingUserId(null);
    } else {
      // Add new user
      const newUser = {
        id: `${users.length + 1}`,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        lastLogin: '-',
        isActive: formData.isActive
      };

      setUsers((prev) => [...prev, newUser]);
    }

    // Reset form
    setFormData({
      email: '',
      name: '',
      role: 'volunteer',
      isActive: true
    });

    setShowAddForm(false);
  };

  const handleEdit = (userId: string) => {
    const userToEdit = users.find((u) => u.id === userId);

    if (userToEdit) {
      setFormData({
        email: userToEdit.email,
        name: userToEdit.name,
        role: userToEdit.role as 'superadmin' | 'editor' | 'volunteer',
        isActive: userToEdit.isActive
      });

      setEditingUserId(userId);
      setShowAddForm(true);
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      )
    );
  };

  const formatDate = (dateString: string) => {
    if (dateString === '-') return 'Never';

    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <WithPermission permission="manage_users">
          <button
            onClick={() => {
              setEditingUserId(null);
              setFormData({
                email: '',
                name: '',
                role: 'volunteer',
                isActive: true
              });
              setShowAddForm(!showAddForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : 'Add New User'}
          </button>
        </WithPermission>
      </div>

      {/* Add/Edit User Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingUserId ? 'Edit User' : 'Add New User'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  User Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="editor">Editor</option>
                  <WithPermission permission="manage_users">
                    <option value="superadmin">Super Admin</option>
                  </WithPermission>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Account
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                {editingUserId ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name / Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Login
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <WithPermission permission="manage_users">
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </WithPermission>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-500">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'superadmin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'editor'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role === 'superadmin'
                        ? 'Super Admin'
                        : user.role === 'editor'
                        ? 'Editor'
                        : 'Volunteer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <WithPermission
                      permission="manage_users"
                      fallback={
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      }
                    >
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </WithPermission>
                  </td>
                  <WithPermission permission="manage_users">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      {user.id !== '1' && ( // Prevent deleting super admin
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </WithPermission>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
