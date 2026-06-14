export const emailService = {
  sendOtp: async (email: string, token: string, type: 'register' | 'login') => {
    console.log(`[MOCK] Sending ${type} OTP email to ${email} with token ${token}`);
    
    if (process.env.RESEND_API_KEY) {
      const subject = type === 'register' ? 'Verifikasi Email ARHAT POS' : 'Kode OTP Login ARHAT POS';
      const html = `<p>Kode OTP Anda adalah: <strong>${token}</strong></p><p>Kode ini berlaku selama 15 menit.</p>`;
      
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'ARHAT POS <onboarding@resend.dev>', // Change to verified domain if available
            to: email,
            subject: subject,
            html: html
          })
        });
        
        if (!response.ok) {
          const errData = await response.json();
          console.error('[Resend Error]', errData);
        } else {
          console.log('[Resend Success] Email sent successfully');
        }
      } catch (error) {
        console.error('[Resend Error]', error);
      }
    }
  },
  sendPasswordResetEmail: async (email: string, token: string) => {
    console.log(`[MOCK] Sending password reset email to ${email} with token ${token}`);
  }
};

