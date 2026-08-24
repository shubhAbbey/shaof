/**
 * External SMS / OTP Provider Abstraction
 */
import type { SmsSendResult, OtpType } from '@ecom/types';

export interface ISmsProvider {
  name: string;
  sendOtp(mobile: string, otp: string, otpType: OtpType): Promise<SmsSendResult>;
}

export class MockSmsProvider implements ISmsProvider {
  name = 'mock';

  async sendOtp(mobile: string, _otp: string, otpType: OtpType): Promise<SmsSendResult> {
    // In mock provider, simulated delivery without logging sensitive OTP
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      provider: 'mock',
    };
  }
}

export class Fast2SmsProvider implements ISmsProvider {
  name = 'fast2sms';
  private apiKey: string;
  private senderId: string;

  constructor(apiKey: string, senderId?: string) {
    this.apiKey = apiKey;
    this.senderId = senderId || 'FSTSMS';
  }

  async sendOtp(mobile: string, otp: string, otpType: OtpType): Promise<SmsSendResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Fast2SMS API key is not configured',
        provider: 'fast2sms',
      };
    }

    try {
      const raw10Digit = mobile.replace(/^\+91/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: raw10Digit,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          success: false,
          error: `Fast2SMS returned HTTP ${res.status}`,
          provider: 'fast2sms',
        };
      }

      const json = await res.json();
      if (json.return === true) {
        return {
          success: true,
          messageId: json.request_id || `fst-${Date.now()}`,
          provider: 'fast2sms',
        };
      }

      return {
        success: false,
        error: json.message?.[0] || 'Fast2SMS delivery failed',
        provider: 'fast2sms',
      };
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        error: isTimeout ? 'Fast2SMS request timed out' : err.message || 'Fast2SMS network error',
        provider: 'fast2sms',
      };
    }
  }
}

export class TwilioSmsProvider implements ISmsProvider {
  name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendOtp(mobile: string, otp: string, otpType: OtpType): Promise<SmsSendResult> {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      return {
        success: false,
        error: 'Twilio credentials are incomplete',
        provider: 'twilio',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const body = new URLSearchParams({
        To: mobile,
        From: this.fromNumber,
        Body: `Your EcomFashion verification code is ${otp}. Valid for 5 minutes.`,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          success: false,
          error: `Twilio returned HTTP ${res.status}`,
          provider: 'twilio',
        };
      }

      const json = await res.json();
      return {
        success: true,
        messageId: json.sid,
        provider: 'twilio',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Twilio request timed out' : err.message,
        provider: 'twilio',
      };
    }
  }
}

export function getSmsProvider(): ISmsProvider {
  const providerType = (process.env.SMS_PROVIDER || 'mock').toLowerCase();

  if (providerType === 'fast2sms' && process.env.SMS_API_KEY) {
    return new Fast2SmsProvider(process.env.SMS_API_KEY, process.env.SMS_SENDER_ID);
  }

  if (
    providerType === 'twilio' &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  ) {
    return new TwilioSmsProvider(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_FROM_NUMBER
    );
  }

  return new MockSmsProvider();
}
