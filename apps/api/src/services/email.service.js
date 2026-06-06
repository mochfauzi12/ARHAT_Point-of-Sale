export const emailService = {
    sendVerificationEmail: async (email, token) => {
        console.log(`[MOCK] Sending verification email to ${email} with token ${token}`);
    },
    sendPasswordResetEmail: async (email, token) => {
        console.log(`[MOCK] Sending password reset email to ${email} with token ${token}`);
    }
};
