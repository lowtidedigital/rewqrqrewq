import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import { config } from '@/config';

// Initialize the User Pool
const userPool = new CognitoUserPool({
  UserPoolId: config.cognitoUserPoolId,
  ClientId: config.cognitoClientId,
});

export interface AuthUser {
  email: string;
  name?: string;
  sub: string;
}

export interface AuthError {
  code: string;
  message: string;
}

// Get current session (returns null if not authenticated)
export const getCurrentSession = (): Promise<CognitoUserSession | null> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(session);
    });
  });
};

// Get current user from session
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const session = await getCurrentSession();
  if (!session) return null;

  const idToken = session.getIdToken();
  const payload = idToken.decodePayload();

  return {
    email: payload.email,
    name: payload.name,
    sub: payload.sub,
  };
};

// Get JWT access token for API calls
export const getAccessToken = async (): Promise<string | null> => {
  const session = await getCurrentSession();
  if (!session) return null;
  return session.getAccessToken().getJwtToken();
};

// Get JWT ID token (contains user claims)
export const getIdToken = async (): Promise<string | null> => {
  const session = await getCurrentSession();
  if (!session) return null;
  return session.getIdToken().getJwtToken();
};

// Sign up a new user
export const signUp = (
  email: string,
  password: string,
  name: string
): Promise<ISignUpResult> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
    ];

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(formatAuthError(err));
        return;
      }
      if (!result) {
        reject({ code: 'UnknownError', message: 'Sign up failed' });
        return;
      }
      resolve(result);
    });
  });
};

// Confirm sign up with verification code
export const confirmSignUp = (email: string, code: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(formatAuthError(err));
        return;
      }
      resolve();
    });
  });
};

// Resend confirmation code
export const resendConfirmationCode = (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        reject(formatAuthError(err));
        return;
      }
      resolve();
    });
  });
};

// Sign in
export const signIn = (
  email: string,
  password: string
): Promise<CognitoUserSession> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(formatAuthError(err));
      },
      newPasswordRequired: () => {
        reject({
          code: 'NewPasswordRequired',
          message: 'Please set a new password',
        });
      },
    });
  });
};

// Sign out
export const signOut = (): Promise<void> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    resolve();
  });
};

// Forgot password - initiate reset
export const forgotPassword = (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(formatAuthError(err));
      },
    });
  });
};

// Confirm forgot password with code and new password
export const confirmForgotPassword = (
  email: string,
  code: string,
  newPassword: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(formatAuthError(err));
      },
    });
  });
};

// Change password for authenticated user
export const changePassword = (
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      reject({ code: 'NotAuthenticated', message: 'You must be logged in to change your password' });
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        reject({ code: 'SessionExpired', message: 'Your session has expired. Please log in again' });
        return;
      }

      cognitoUser.changePassword(oldPassword, newPassword, (changeErr) => {
        if (changeErr) {
          reject(formatAuthError(changeErr));
          return;
        }
        resolve();
      });
    });
  });
};

// Update user attributes (like name)
export const updateUserAttributes = (
  attributes: { Name: string; Value: string }[]
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      reject({ code: 'NotAuthenticated', message: 'You must be logged in' });
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        reject({ code: 'SessionExpired', message: 'Your session has expired. Please log in again' });
        return;
      }

      const cognitoAttributes = attributes.map(
        attr => new CognitoUserAttribute(attr)
      );

      cognitoUser.updateAttributes(cognitoAttributes, (updateErr) => {
        if (updateErr) {
          reject(formatAuthError(updateErr));
          return;
        }
        resolve();
      });
    });
  });
};

// Format Cognito errors to consistent format
const formatAuthError = (error: any): AuthError => {
  const code = error.code || error.name || 'UnknownError';
  let message = error.message || 'An unknown error occurred';

  // User-friendly error messages
  switch (code) {
    case 'UserNotFoundException':
      message = 'No account found with this email address';
      break;
    case 'NotAuthorizedException':
      message = 'Incorrect email or password';
      break;
    case 'UserNotConfirmedException':
      message = 'Please verify your email address first';
      break;
    case 'UsernameExistsException':
      message = 'An account with this email already exists';
      break;
    case 'InvalidPasswordException':
      message = 'Password does not meet requirements';
      break;
    case 'CodeMismatchException':
      message = 'Invalid verification code';
      break;
    case 'ExpiredCodeException':
      message = 'Verification code has expired. Please request a new one';
      break;
    case 'LimitExceededException':
      message = 'Too many attempts. Please try again later';
      break;
  }

  return { code, message };
};
