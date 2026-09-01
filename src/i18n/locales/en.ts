export default {
  "common": {
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "back": "Back",
    "confirm": "Confirm",
    "actions": "Actions",
    "search": "Search",
    "loading": "Loading...",
    "yes": "Yes",
    "no": "No",
    "apiKeys": "API Keys",
    "or": "or"
  },
  "language": {
    "id": "Indonesian",
    "en": "English",
    "zh": "Mandarin",
    "switchLabel": "Switch language"
  },
  "nav": {
    "dashboard": "Dashboard",
    "projects": "Projects",
    "testSuites": "Test Suites",
    "qualityDashboard": "Quality Dashboard",
    "apiKeys": "API Keys",
    "activityLog": "Activity Log"
  },
  "header": {
    "openMenu": "Open navigation menu",
    "closeMenu": "Close navigation menu",
    "logout": "Logout"
  },
  "auth": {
    "login": {
      "brand": "SQAHUB",
      "subtitle": "Sign in to access the Quality Dashboard",
      "usernameLabel": "Username",
      "usernamePlaceholder": "Enter your username",
      "passwordLabel": "Password",
      "passwordPlaceholder": "********",
      "forgotPassword": "Forgot password?",
      "submit": "Log in to SQAHub",
      "loggingIn": "Logging in... Redirecting...",
      "googleButton": "Log in with Google",
      "noAccount": "Don't have an account? Sign up",
      "backToLanding": "Back to Landing Page",
      "errorGeneric": "Login failed. Check your username and password.",
      "registrationSuccess": "Registration successful for {{username}}. Please log in."
    },
    "register": {
      "title": "Sign Up for SQAHub",
      "subtitle": "Create your account and choose your role on the team.",
      "usernameLabel": "Username",
      "nameLabel": "Full Name",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "roleLabel": "Role",
      "rolePlaceholder": "Choose a Role",
      "roleTester": "Tester",
      "roleDeveloper": "Developer",
      "submit": "Create Account",
      "googleButton": "Sign up with Google",
      "haveAccount": "Already have an account? Log in here.",
      "backToHome": "Back to Home",
      "successGeneric": "Registration successful! You'll be redirected to the login page.",
      "errorGeneric": "Registration failed. Please try again.",
      "errorConnection": "Could not connect to the server. Make sure the API is running."
    },
    "forgotPassword": {
      "title": "Forgot Password?",
      "subtitle": "SQAHub logs in with a username, but password resets are sent via your <bold>account email</bold> — enter the email you used when registering and we'll send a reset link if it's registered.",
      "emailLabel": "Registered Email",
      "emailPlaceholder": "name@company.com",
      "emailHint": "Not your login username — use the email address you registered with.",
      "submit": "Send Reset Link",
      "backToLogin": "Back to Login",
      "sentMessage": "If <bold>{{email}}</bold> is registered, we've sent password reset instructions to that address. Check your spam folder too.",
      "errorGeneric": "Failed to send the request. Please try again in a moment."
    },
    "resetPassword": {
      "title": "Reset Password",
      "subtitle": "Create a new password for your account.",
      "incompleteLink": "The reset link is incomplete. Please reopen the link from your email.",
      "requestNewLink": "Request a New Link",
      "successMessage": "Password updated successfully. Redirecting to login...",
      "newPasswordLabel": "New Password",
      "newPasswordPlaceholder": "At least 8 characters",
      "confirmPasswordLabel": "Confirm Password",
      "confirmPasswordPlaceholder": "Re-enter your new password",
      "submit": "Save New Password",
      "backToLogin": "Back to Login",
      "errorMinLength": "Password must be at least {{min}} characters.",
      "errorMismatch": "Passwords do not match.",
      "errorGeneric": "The reset link is invalid or has expired."
    },
    "oauth2Redirect": {
      "completing": "Completing login with Google...",
      "failedTitle": "Google Login Failed",
      "backToLogin": "Back to Login",
      "incompleteResponse": "Google's response was incomplete. Please try again."
    }
  },
  "dashboard": {
    "welcomeBack": "Welcome back,",
    "quickLinks": {
      "projectsTitle": "Projects",
      "projectsDescription": "Manage all of your test projects",
      "testSuitesTitle": "Test Suites",
      "testSuitesDescription": "View execution history & start a new run",
      "qualityDashboardTitle": "Quality Dashboard",
      "qualityDashboardDescription": "Pass rate trends & test case coverage per project",
      "apiKeysTitle": "API Keys",
      "apiKeysDescription": "Integrate with Katalon, Jenkins, and more.",
      "activityLogTitle": "Activity Log",
      "activityLogDescription": "Audit all system activity"
    },
    "recentProjects": {
      "title": "Recent Projects",
      "subtitle": "Recently updated projects",
      "viewAll": "View all",
      "empty": "No projects yet. Start by creating your first project.",
      "noDescription": "No description"
    }
  },
  "notFound": {
    "title": "Page Not Found",
    "description": "Sorry, we couldn't find the page you're looking for. Maybe you mistyped the address?",
    "backToDashboard": "Back to Dashboard"
  },
  "projects": {
    "title": "Project Hub",
    "subtitle": "Manage and monitor all of your test automation systems.",
    "newProject": "New Project",
    "searchPlaceholder": "Search projects on this page...",
    "manageTeam": "Manage Team",
    "noDescription": "No description available.",
    "features": "Features",
    "emptySearchTitle": "No results found",
    "emptySearchHint": "Try a different keyword.",
    "emptyTitle": "No projects yet",
    "emptyHint": "Start by creating your first project now.",
    "createFirst": "Create Project",
    "errorLoading": "Failed to load data. Check your API connection.",
    "deleteConfirmTitle": "Delete Project?",
    "deleteConfirmDescription": "'{{name}}' will be permanently deleted.",
    "deleteConfirmAction": "Delete",
    "deleteSuccess": "Deleted",
    "deleteError": "Failed",
    "status": {
      "active": "active",
      "completed": "completed",
      "suspended": "suspended",
      "archived": "archived",
      "maintenance": "maintenance"
    }
  }
} as const;
