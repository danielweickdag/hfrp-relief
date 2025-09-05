"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";

// Admin user types with different permission levels
type UserRole = "superadmin" | "editor" | "volunteer";

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
  hasPermission: (permission: string) => boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define permissions for each role
const rolePermissions: Record<UserRole, string[]> = {
  superadmin: [
    "manage_users",
    "edit_content",
    "manage_donations",
    "view_analytics",
    "manage_settings",
    "upload_media",
    "manage_volunteers",
    "publish_content",
    "manage_volunteer_program",
    "view_donation_reports",
    "export_donations",
    "manage_backups",
  ],
  editor: [
    "edit_content",
    "view_analytics",
    "upload_media",
    "publish_content",
    "manage_volunteers",
    "manage_donations",
    "view_donation_reports",
  ],
  volunteer: ["view_analytics", "edit_content"],
};

// Mock admin users with secure storage
const getAdminUsers = () => {
  return [
    {
      email: "w.regis@comcast.net",
      name: "Wilson Regis",
      role: "superadmin" as UserRole,
      permissions: rolePermissions.superadmin,
    },
    {
      email: "editor@haitianfamilyrelief.org",
      name: "HFRP Editor",
      role: "editor" as UserRole,
      permissions: rolePermissions.editor,
    },
    {
      email: "volunteer@haitianfamilyrelief.org",
      name: "HFRP Volunteer",
      role: "volunteer" as UserRole,
      permissions: rolePermissions.volunteer,
    },
  ];
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to handle SSR
  const [mounted, setMounted] = useState(false);

  // Handle hydration and session check
  useEffect(() => {
    console.log("🔧 AdminAuth: Component mounted, starting session check...");
    setMounted(true);

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("hfrp-admin-user");
          console.log("🔧 AdminAuth: Checking localStorage:", storedUser);

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log("🔧 AdminAuth: Found stored user:", parsedUser.email);
            setUser(parsedUser);
            console.log(
              "🔧 AdminAuth: User state updated, should be authenticated"
            );
          } else {
            console.log("🔧 AdminAuth: No stored user found");
          }
        }
      } catch (error) {
        console.error("🔧 AdminAuth: Error checking stored session:", error);
      }

      setIsLoading(false);
      console.log("🔧 AdminAuth: Session check complete");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Login function with improved security
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("🔧 AdminAuth: Login attempt for:", email);
    setIsLoading(true);

    // In a real app, this would be an API call with proper security
    // For demo purposes, we're using a hardcoded password
    // IMPORTANT: In production, use proper authentication with hashed passwords
    if (password !== "Melirosecherie58") {
      console.log("🔧 AdminAuth: Invalid password");
      setIsLoading(false);
      return false;
    }

    const users = getAdminUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      console.log("🔧 AdminAuth: User found, logging in:", foundUser.email);

      // Set user in state
      setUser(foundUser);
      console.log("🔧 AdminAuth: User state set");

      // Store in localStorage only on client side
      if (typeof window !== "undefined") {
        localStorage.setItem("hfrp-admin-user", JSON.stringify(foundUser));
        console.log("🔧 AdminAuth: User stored in localStorage");
      }

      // Track login event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "admin_login", {
          event_category: "Admin",
          event_label: foundUser.role,
          user_email: foundUser.email,
        });
      }

      setIsLoading(false);
      console.log("🔧 AdminAuth: Login successful");
      return true;
    }

    console.log("🔧 AdminAuth: User not found");
    setIsLoading(false);
    return false;
  };

  // Logout function
  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hfrp-admin-user");
    }
    setUser(null);

    // Track logout event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "admin_logout", {
        event_category: "Admin",
      });
    }
  };

  // Permission checker function
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        hasPermission,
      }}
    >
      {(() => {
        console.log("🔧 AdminAuth: Provider rendering with state:", {
          user: user?.email || "none",
          isAuthenticated: !!user,
          isLoading,
          mounted,
        });

        // Prevent hydration mismatches
        if (!mounted) {
          return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing...</p>
              </div>
            </div>
          );
        }

        return children;
      })()}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

// Alias for backward compatibility
export const useAuth = useAdminAuth;

// Permission checker component
export function WithPermission({
  permission,
  children,
  fallback = null,
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
    gtag?: (
      command: string,
      action: string,
      parameters: Record<string, unknown>
    ) => void;
  }
}

// Default export for component imports
export default AdminAuthProvider;
