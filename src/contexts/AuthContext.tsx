import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  signOut as cognitoSignOut,
  confirmSignUp as cognitoConfirmSignUp,
  forgotPassword as cognitoForgotPassword,
  confirmForgotPassword as cognitoConfirmForgotPassword,
  resendConfirmationCode as cognitoResendCode,
  getCurrentUser,
  getCurrentSession,
  AuthUser,
  AuthError,
} from '@/lib/cognito';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ requiresConfirmation: boolean }>;
  signOut: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing session on mount
  const refreshUser = useCallback(async () => {
    try {
      const session = await getCurrentSession();
      if (session) {
        const user = await getCurrentUser();
        setState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await cognitoSignIn(email, password);
      await refreshUser();
    } catch (error) {
      throw error as AuthError;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ requiresConfirmation: boolean }> => {
    try {
      const result = await cognitoSignUp(email, password, name);
      return { requiresConfirmation: !result.userConfirmed };
    } catch (error) {
      throw error as AuthError;
    }
  };

  const signOut = async (): Promise<void> => {
    await cognitoSignOut();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const confirmSignUp = async (email: string, code: string): Promise<void> => {
    try {
      await cognitoConfirmSignUp(email, code);
    } catch (error) {
      throw error as AuthError;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await cognitoForgotPassword(email);
    } catch (error) {
      throw error as AuthError;
    }
  };

  const confirmForgotPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await cognitoConfirmForgotPassword(email, code, newPassword);
    } catch (error) {
      throw error as AuthError;
    }
  };

  const resendConfirmationCode = async (email: string): Promise<void> => {
    try {
      await cognitoResendCode(email);
    } catch (error) {
      throw error as AuthError;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        confirmSignUp,
        forgotPassword,
        confirmForgotPassword,
        resendConfirmationCode,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
