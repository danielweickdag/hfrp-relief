'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';

// Admin user types with different permission levels
type UserRole = 'superadmin' | 'editor' | 'volunteer';

interface AdminUser {
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define permissions for each role
const rolePermissions: Record<UserRole, string[]> = {
  superadmin: [
    'manage_users',
    'edit_content',
    'manage_donations',
    'view_analytics',
    'manage_settings',
    'upload_media',
    'manage_volunteers',
    'publish_content',
    'manage_volunteer_program',
    'view_donation_reports',
    'export_donations',
    'manage_backups'
  ],
  editor: [
    'edit_content',
    'view_analytics',
    'upload_media',
    'publish_content',
    'manage_volunteers',
    'manage_donations',
    'view_donation_reports'
  ],
  volunteer: [
    'view_analytics',
    'edit_content'
  ]
};

// Mock admin users with secure storage
const getAdminUsers = () => {
  return [
    {
      email: 'w.regis@comcast.net',
      name: 'Wilson Regis',
      role: 'superadmin' as UserRole,
      permissions: rolePermissions.superadmin
    },
    {
      email: 'editor@haitianfamilyrelief.org',
      name: 'HFRP Editor',
      role: 'editor' as UserRole,
      permissions: rolePermissions.editor
    },
    {
      email: 'volunteer@haitianfamilyrelief.org',
      name: 'HFRP Volunteer',
      role: 'volunteer' as UserRole,
      permissions: rolePermissions.volunteer
    }
  ];
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('hfrp-admin-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('hfrp-admin-user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function with improved security
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // In a real app, this would be an API call with proper security
    // For demo purposes, we're using a hardcoded password
    // IMPORTANT: In production, use proper authentication with hashed passwords
    if (password !== 'Melirosecherie58') {
      setIsLoading(false);
      return false;
    }

    const users = getAdminUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      // Set user in state
      setUser(foundUser);

      // Store in localStorage (use secure HTTP-only cookies in production)
      localStorage.setItem('hfrp-admin-user', JSON.stringify(foundUser));

      // Track login event
      if (window.gtag) {
        window.gtag('event', 'admin_login', {
          event_category: 'Admin',
          event_label: foundUser.role,
          user_email: foundUser.email
        });
      }

      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('hfrp-admin-user');
    setUser(null);

    // Track logout event
    if (window.gtag) {
      window.gtag('event', 'admin_logout', {
        event_category: 'Admin'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// Permission checker component
export function WithPermission({
  permission,
  children,
  fallback = null
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user } = useAdminAuth();

  if (!user || !user.permissions.includes(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Extend window interface for analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters: Record<string, unknown>) => void;
  }
}
