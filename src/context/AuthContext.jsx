import React, { createContext, useContext, useState } from 'react';
import { loginApi, signupApi, sendVerificationEmailApi, verifyEmailCodeApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('manim_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      const backendUserId = res.user_id || res.id || res.user?.id || res.user?.user_id;
      const authenticatedUser = res.user || {
        id: backendUserId || 'user-101',
        name: email.split('@')[0] || 'Developer',
        email: email,
        token: res.token || `jwt-${Date.now()}`,
        role: 'Enterprise Member',
        avatar: email.substring(0, 2).toUpperCase()
      };
      
      if (authenticatedUser && !authenticatedUser.id) {
        authenticatedUser.id = backendUserId || 'user-101';
      }
      
      if (res.token) authenticatedUser.token = res.token;

      setUser(authenticatedUser);
      localStorage.setItem('manim_user', JSON.stringify(authenticatedUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signup function accepting:
   * firstName, surname, email, password, phone
   */
  const signup = async ({ firstName, surname, email, password, phone }) => {
    setLoading(true);
    const signupPayload = {
      first_name: firstName,
      surname: surname,
      name: `${firstName} ${surname}`.trim(),
      email: email,
      password: password,
      phone: phone
    };

    try {
      const res = await signupApi(signupPayload);
      // await sendVerificationEmailApi(email);
      
      const backendUserId = res?.user_id || res?.id || res?.user?.id || res?.user?.user_id;
      
      // Bypass email verification for now and log in immediately
      const fullName = `${firstName} ${surname}`.trim() || 'Developer';
      const verifiedUser = {
        id: backendUserId || `user-${Date.now()}`,
        firstName: firstName,
        surname: surname,
        name: fullName,
        email: email,
        phone: phone,
        verified: true,
        token: `jwt-verified-${Date.now()}`,
        role: 'Pro Member',
        avatar: fullName ? fullName.substring(0, 2).toUpperCase() : 'DV'
      };

      setUser(verifiedUser);
      localStorage.setItem('manim_user', JSON.stringify(verifiedUser));
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete email verification and log user in
   */
  const verifyAndCompleteSignup = async (email, code, userData) => {
    setLoading(true);
    try {
      await verifyEmailCodeApi(email, code);
      const fullName = `${userData?.firstName || ''} ${userData?.surname || ''}`.trim() || 'Developer';
      const verifiedUser = {
        id: `user-${Date.now()}`,
        firstName: userData?.firstName,
        surname: userData?.surname,
        name: fullName,
        email: email,
        phone: userData?.phone,
        verified: true,
        token: `jwt-verified-${Date.now()}`,
        role: 'Pro Member',
        avatar: fullName ? fullName.substring(0, 2).toUpperCase() : 'DV'
      };

      setUser(verifiedUser);
      localStorage.setItem('manim_user', JSON.stringify(verifiedUser));
      return true;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email) => {
    return await sendVerificationEmailApi(email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('manim_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      verifyAndCompleteSignup, 
      resendVerificationEmail, 
      logout, 
      isAuthenticated: !!user, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
