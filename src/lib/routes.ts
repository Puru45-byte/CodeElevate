/**
 * Single source of truth for all internal application routes in CodeElevate.
 * Always import and use ROUTES for navigation, links, and redirects.
 */
export const ROUTES = {
  // Public Pages
  home: "/",
  about: "/about",
  contact: "/contact",
  howItWorks: "/how-it-works",
  internships: "/internships",
  internshipDetail: (slug: string) => `/internships/${slug}`,
  apply: (slug: string) => `/apply/${slug}`,
  verify: "/verify",
  verifyCertificate: (slug: string) => `/verify/${slug}`,
  design: "/design",

  // Auth Pages
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // Legal Pages
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  refundPolicy: "/refund-policy",
  shippingPolicy: "/shipping-policy",

  // Student Dashboard Pages
  dashboard: {
    home: "/dashboard",
    learning: (enrollmentId?: string) =>
      enrollmentId ? `/dashboard/learning?enrollment=${enrollmentId}` : "/dashboard/learning",
    tasks: "/dashboard/tasks",
    taskDetail: (taskId: string, enrollmentId?: string) =>
      enrollmentId
        ? `/dashboard/tasks/${taskId}?enrollment=${enrollmentId}`
        : `/dashboard/tasks/${taskId}`,
    submissions: (enrollmentId?: string) =>
      enrollmentId
        ? `/dashboard/submissions?enrollment=${enrollmentId}`
        : "/dashboard/submissions",
    applications: "/dashboard/applications",
    certificates: (highlightId?: string) =>
      highlightId
        ? `/dashboard/certificates?highlight=${highlightId}`
        : "/dashboard/certificates",
    notifications: "/dashboard/notifications",
    profile: "/dashboard/profile",
  },

  // Admin Console Pages
  admin: {
    home: "/admin",
    applications: "/admin/applications",
    certificates: "/admin/certificates",
    internships: "/admin/internships",
    newInternship: "/admin/internships/new",
    editInternship: (id: string) => `/admin/internships/${id}`,
    messages: "/admin/messages",
    modules: "/admin/modules",
    notifications: "/admin/notifications",
    payments: "/admin/payments",
    settings: "/admin/settings",
    students: "/admin/students",
    studentDetail: (id: string) => `/admin/students/${id}`,
    submissions: "/admin/submissions",
    tasks: "/admin/tasks",
    newTask: "/admin/tasks/new",
    editTask: (id: string) => `/admin/tasks/${id}`,
    templates: "/admin/templates",
  },
} as const;

export type Routes = typeof ROUTES;
