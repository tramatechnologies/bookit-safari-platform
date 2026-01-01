/**
 * Webhook signature verification utility
 * Verifies that webhook requests are authentic from ClickPesa
 */

/**
 * Verify ClickPesa webhook signature
 * @param payload - Raw request body as string
 * @param signature - Signature from x-clickpesa-signature header
 * @param secret - ClickPesa webhook secret key
 * @returns Promise<boolean> - true if signature is valid
 */
export async function verifyClickPesaSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // ClickPesa typically uses HMAC-SHA256
    // Format: signature = HMAC-SHA256(payload, secret)
    // Note: Adjust this based on ClickPesa's actual signature format
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);
    
    // Use Web Crypto API for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Compare signatures (constant-time comparison to prevent timing attacks)
    if (signature.length !== computedSignature.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ computedSignature.charCodeAt(i);
    }
    
    return result === 0;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Alternative: If ClickPesa uses a different signature format
 * Adjust this function based on ClickPesa's documentation
 */
export async function verifyClickPesaSignatureAlternative(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Example: If ClickPesa uses base64 encoded HMAC
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  
  // Constant-time comparison
  if (signature.length !== computedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ computedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

