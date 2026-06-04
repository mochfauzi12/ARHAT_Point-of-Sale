export const emailService = {
  sendVerificationEmail: async (email: string, token: string) => {
    console.log(`[MOCK] Sending verification email to ${email} with token ${token}`);
  },
  sendPasswordResetEmail: async (email: string, token: string) => {
    console.log(`[MOCK] Sending password reset email to ${email} with token ${token}`);
  }
};
