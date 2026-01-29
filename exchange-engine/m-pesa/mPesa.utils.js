import axios from 'axios';
import { saveCollectionItem, updateCollectionItem } from '../item/item.service';
import forge from 'node-forge';
import fs from 'fs';

export const handleMPesaRefreshTokenProcess = async (
  db,
  projectId,
  enableAuditTrail,
  user,
  tenant,
  headers,
  environment,
  consumerKey,
  consumerSecret,
  mPesaEnvironment,
  mPesaTokenCollection,
  existingToken,
) => {
  try {
    const url =
      mPesaEnvironment === 'production'
        ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const { data: newTokens } = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const updatedTokenPayload = {
      access_token: newTokens.access_token,
      expiry_date: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
      userId: user?.uuid,
      tenantId: tenant?.uuid,
    };
    if (existingToken) {
      await updateCollectionItem(
        db,
        projectId,
        environment,
        enableAuditTrail,
        mPesaTokenCollection,
        existingToken?.uuid,
        updatedTokenPayload,
        user,
        headers,
      );
    } else {
      await saveCollectionItem(
        db,
        projectId,
        enableAuditTrail,
        mPesaTokenCollection,
        updatedTokenPayload,
        user,
        headers,
        environment,
      );
    }
    return {
      code: 200,
      message: 'M-Pesa token refreshed successfully',
      token: updatedTokenPayload,
    };
  } catch (error) {
    console.error('Error in handleMPesaRefreshTokenProcess:', error);
    return {
      code: 500,
      message: 'Error generating M-Pesa access token',
      error: error?.message || error,
    };
  }
};

export const prepareMPesaCallbackUrls = (host, type, purpose) => {
  if (purpose === 'confirmation') {
    return `https://${host}/api/v2/developer/${type}/${purpose}`;
  } else return `https://${host}/api/v1/mpesa/${type}/${purpose}`;
};

export const encryptMpesaSecurityCredential = (initiatorPassword, certificatePath) => {
  const certPem = fs.readFileSync(certificatePath, 'utf8');
  const certificate = forge.pki.certificateFromPem(certPem);
  const publicKey = certificate.publicKey;
  const encrypted = publicKey.encrypt(initiatorPassword, 'RSAES-PKCS1-V1_5');
  return forge.util.encode64(encrypted);
};
