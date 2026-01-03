/**
 * ClickPesa API Client
 * Handles all ClickPesa API interactions following official documentation
 * https://docs.clickpesa.com/payment-api/mobile-money-payment-api/mobile-money-payment-api-overview
 */

const CLICKPESA_API_URL = Deno.env.get('CLICKPESA_API_URL') || 'https://api.clickpesa.com';
const CLICKPESA_CLIENT_ID = Deno.env.get('CLICKPESA_CLIENT_ID')!;
const CLICKPESA_API_KEY = Deno.env.get('CLICKPESA_API_KEY')!;

interface ClickPesaAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PreviewPushRequest {
  phoneNumber: string;
  amount: number;
  currency: string;
  orderReference: string;
}

interface PreviewPushResponse {
  activeMethods: Array<{
    name: string;
    status: 'AVAILABLE' | 'UNAVAILABLE';
    fee?: number;
  }>;
  sender?: {
    accountName: string;
    accountNumber: string;
    accountProvider: string;
  };
}

interface InitiatePushRequest {
  phoneNumber: string;
  amount: number;
  currency: string;
  orderReference: string;
}

interface InitiatePushResponse {
  id: string;
  status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'SETTLED';
  channel: string;
  orderReference: string;
  collectedAmount?: string;
  collectedCurrency: string;
  createdAt: string;
  clientId: string;
  transactionId?: string;
}

interface PaymentStatusResponse {
  id: string;
  status: 'SUCCESS' | 'SETTLED' | 'PROCESSING' | 'PENDING' | 'FAILED';
  paymentReference: string;
  orderReference: string;
  collectedAmount: number;
  collectedCurrency: string;
  message: string;
  updatedAt: string;
  createdAt: string;
  customer?: {
    customerName: string;
    customerPhoneNumber: string;
    customerEmail?: string;
  };
  clientId: string;
}

/**
 * Get authorization token from ClickPesa
 * Uses API Keys to generate Authorization Token
 */
async function getAuthToken(): Promise<string> {
  try {
    const response = await fetch(`${CLICKPESA_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLICKPESA_CLIENT_ID,
        client_secret: CLICKPESA_API_KEY,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get auth token: ${response.status} - ${errorText}`);
    }

    const data: ClickPesaAuthResponse = await response.json();
    return data.access_token;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('ClickPesa auth error:', error);
    }
    throw error;
  }
}

/**
 * Step 1: Preview USSD-PUSH Request
 * Validates payment details and verifies payment method availability
 * Official ClickPesa endpoint: POST /third-parties/payments/preview-ussd-push-request
 */
export async function previewPushRequest(
  request: PreviewPushRequest
): Promise<PreviewPushResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${CLICKPESA_API_URL}/third-parties/payments/preview-ussd-push-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        phoneNumber: request.phoneNumber,
        amount: request.amount,
        currency: request.currency || 'TZS',
        orderReference: request.orderReference,
      }),
    });

    const data: PreviewPushResponse = await response.json();

    if (!response.ok) {
      throw new Error(`Preview request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('ClickPesa preview error:', error);
    }
    throw error;
  }
}

/**
 * Step 2: Initiate USSD-PUSH Request
 * Sends the USSD-PUSH request to customer's mobile device
 * Official ClickPesa endpoint: POST /third-parties/payments/initiate-ussd-push-request
 */
export async function initiatePushRequest(
  request: InitiatePushRequest
): Promise<InitiatePushResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${CLICKPESA_API_URL}/third-parties/payments/initiate-ussd-push-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        phoneNumber: request.phoneNumber,
        amount: request.amount,
        currency: request.currency || 'TZS',
        orderReference: request.orderReference,
      }),
    });

    const data: InitiatePushResponse = await response.json();

    if (!response.ok) {
      throw new Error(`Initiate push failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('ClickPesa initiate error:', error);
    }
    throw error;
  }
}

/**
 * Step 3: Check Payment Status
 * Queries for the payment status using order reference
 * Official ClickPesa endpoint: GET /third-parties/payments/{orderReference}
 */
export async function checkPaymentStatus(
  orderReference: string
): Promise<PaymentStatusResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${CLICKPESA_API_URL}/third-parties/payments/${orderReference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data: PaymentStatusResponse = await response.json();

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('ClickPesa status check error:', error);
    }
    throw error;
  }
}

/**
 * Helper function to format mobile number for ClickPesa
 * Removes leading zeros and ensures proper format
 */
export function formatMobileNumber(phone: string, paymentMethod: 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Remove leading zero if present
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // Add country code if not present (Tanzania is +255)
  if (!digits.startsWith('255')) {
    digits = `255${digits}`;
  }

  return digits;
}

/**
 * Validate mobile number format for specific payment method
 */
export function validateMobileNumber(
  phone: string,
  paymentMethod: 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'
): boolean {
  const formatted = formatMobileNumber(phone, paymentMethod);
  
  // Tanzanian mobile numbers should be 12 digits (255 + 9 digits)
  if (formatted.length !== 12) {
    return false;
  }

  // Validate based on payment method
  const prefix = formatted.substring(3, 4); // First digit after country code
  
  switch (paymentMethod) {
    case 'mpesa':
      // M-Pesa numbers typically start with 7 or 6
      return prefix === '7' || prefix === '6';
    case 'tigopesa':
      // Tigo Pesa numbers typically start with 7
      return prefix === '7';
    case 'airtel':
      // Airtel Money numbers typically start with 6 or 7
      return prefix === '6' || prefix === '7';
    case 'halopesa':
      // HaloPesa numbers typically start with any valid operator prefix
      return prefix === '6' || prefix === '7';
    default:
      return true;
  }
}

