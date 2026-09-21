import QRCode from 'qrcode';
import crypto from 'crypto';

export const generateTicketQR = async (ticketData) => {
  try {
    // Generate unique verification hash
    const uniqueString = `${ticketData.registrationId}-${ticketData.eventId}-${ticketData.userId}-${Date.now()}`;
    const hash = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 16).toUpperCase();

    // Data payload embedded in QR
    const qrPayload = JSON.stringify({
      tHash: hash,
      regNo: ticketData.registrationNumber,
      eId: ticketData.eventId,
      uId: ticketData.userId,
      name: ticketData.userName,
      event: ticketData.eventTitle
    });

    // Generate high-quality QR code data URL
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e1b4b', // deep indigo
        light: '#ffffff'
      }
    });

    return {
      hash,
      qrDataUrl,
      payload: qrPayload
    };
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    throw error;
  }
};
