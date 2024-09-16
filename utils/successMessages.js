// errors.js

const Success = {
    AUTH: {
      USER_CREATED: "User created Successfully!, Please verify OTP sent on your email.",
      EMAIL_VERIFIED: "Email verified and logged in successfully!",
      ALREADY_VERIFIED: "Email is already verified",
      OTP_RESENT : "OTP resent Successfully ! please check your email",
      OTP_SENT : "Check your mail for OTP",
      LOGIN_SUCCESS : "Login successful!",
      RESET_SUCCESSFUL : "Password reset successfully!",
      FORGOT_PASSWORD : "Password reset link sent to your email",
      PASSWORD_CHANGED : "Password changed successfully"

    },
    VALIDATION: {
      FIELD_REQUIRED: (field) => `${field} is required!`,
      INVALID_ID: "Invalid ID provided!",
      INVALID_EMAIL_FORMAT: "Invalid email format!",
      PASSWORD_TOO_SHORT: "Password must be at least 8 characters long!",
      PASSWORD_TOO_WEAK: "Password must contain uppercase, lowercase, and a number!",
      PASSWORDS_DO_NOT_MATCH: "Passwords do not match!",
      INVALID_DATE_FORMAT: "Invalid date format!",
      INVALID_PHONE_NUMBER: "Invalid phone number format!",
      FIELD_TOO_LONG: (field, max) => `${field} cannot exceed ${max} characters!`,
      FIELD_TOO_SHORT: (field, min) => `${field} must be at least ${min} characters long!`,
    },
    DATABASE: {
      CONNECTION_FAILED: "Database connection failed!",
      DUPLICATE_ENTRY: "Duplicate entry found!",
      ENTRY_NOT_FOUND: "Requested entry not found!",
      SAVE_FAILED: "Failed to save the data!",
      UPDATE_FAILED: "Failed to update the data!",
      DELETE_FAILED: "Failed to delete the data!",
      TRANSACTION_FAILED: "Database transaction failed!",
    },
    FILE: {
      UPLOAD_FAILED: "File upload failed!",
      FILE_TOO_LARGE: "The uploaded file is too large!",
      UNSUPPORTED_FILE_TYPE: "Unsupported file type!",
      FILE_NOT_FOUND: "File not found!",
    },
    SERVER: {
      INTERNAL_ERROR: "Internal server error occurred!",
      RESOURCE_NOT_FOUND: "Requested resource not found!",
      BAD_REQUEST: "Bad request! Please check the input data.",
      SERVICE_UNAVAILABLE: "Service is currently unavailable. Please try again later!",
      TIMEOUT: "The request timed out. Please try again later!",
    },
    PERMISSIONS: {
      INSUFFICIENT_PRIVILEGES: "You do not have sufficient privileges to perform this action!",
      FORBIDDEN_ACTION: "This action is forbidden!",
    },
    RATE_LIMIT: {
      TOO_MANY_REQUESTS: "Too many requests! Please try again later.",
      RATE_LIMIT_EXCEEDED: "You have exceeded the rate limit!",
    },
    THIRD_PARTY: {
      API_ERROR: "An error occurred while communicating with an external service!",
      PAYMENT_FAILED: "Payment processing failed!",
      AUTHENTICATION_FAILED: "Third-party authentication failed!",
    },
    SESSION: {
      SESSION_EXPIRED: "Your session has expired. Please log in again!",
      SESSION_INVALID: "Invalid session data!",
      SESSION_NOT_FOUND: "Session not found!",
    },
    CONFIGURATION: {
      MISSING_CONFIGURATION: "Required configuration is missing!",
      INVALID_CONFIGURATION: "Invalid configuration provided!",
    },
  };
  
export default Success;

  