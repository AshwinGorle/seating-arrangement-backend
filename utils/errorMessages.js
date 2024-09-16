// errors.js

const Errors = {
    AUTH: {
      FIELDS_REQUIRED: "All fields are required!",
      PASSWORD_MISMATCHED: "Both Password not matching!",
      INVALID_CREDENTIALS: "Email or Password is wrong!",
      LOGIN_FAILED: "Can't login, Something went wrong!",
      UNAUTHORIZED_ACCESS: "You are not authorized to access this resource!",
      TOKEN_EXPIRED: "Your session has expired. Please login again!",
      TOKEN_INVALID: "Invalid token provided!",
      TOKEN_MISSING: "Token is missing in the request!",
      ALREADY_EXISTS :  "User with this email already exists!",
      NOT_FOUND: "User not found!",
      NOT_VERIFIED : "Please verify your email first",
      INVALID_OTP : "Invalid OTP",
      EXPIRED_OTP : "OTP has been Expired!",
      OTP_ALREADY_USED : "OTP has already been used",
      OTP_NOT_FOUND : "Please get reset password email then try again",
      WRONG_PASSWORD : "Wrong password"

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
  
export default Errors;

  