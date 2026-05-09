const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Lincoln Nails <onboarding@resend.dev>';

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL] No RESEND_API_KEY set, skipping email to ${to}`);
    return null;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[EMAIL] ✅ Sent to ${to} | ID: ${data.id}`);
      return data;
    } else {
      console.error(`[EMAIL] ❌ Error: ${JSON.stringify(data)}`);
      return null;
    }
  } catch (err) {
    console.error(`[EMAIL] ❌ Fetch error: ${err.message}`);
    return null;
  }
}

function bookingConfirmationEmail({ customerName, salonName, serviceName, staffName, date, time, duration, price, address }) {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">💅</div>
          <h1 style="color:#111;font-size:24px;margin:0;">Booking Confirmed!</h1>
        </div>
        <p style="color:#555;font-size:16px;">Hi ${customerName},</p>
        <p style="color:#555;">Your appointment at <strong>${salonName}</strong> has been confirmed.</p>
        <div style="background:#fdf2f8;border-radius:8px;padding:20px;margin:24px 0;">
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:6px 0;color:#888;">Service</td><td style="padding:6px 0;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Staff</td><td style="padding:6px 0;font-weight:600;">${staffName}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;font-weight:600;">${date}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Time</td><td style="padding:6px 0;font-weight:600;">${time}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Duration</td><td style="padding:6px 0;font-weight:600;">${duration} min</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Price</td><td style="padding:6px 0;font-weight:600;">$${price}</td></tr>
          </table>
        </div>
        ${address ? `<p style="color:#555;font-size:14px;">📍 ${address}</p>` : ''}
        <p style="color:#888;font-size:13px;margin-top:32px;text-align:center;">We look forward to seeing you!</p>
      </div>
    </body></html>
  `;
}

function shopOwnerNotificationEmail({ salonName, customerName, customerPhone, customerEmail, serviceName, staffName, date, time, duration, price, notes, appUrl }) {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">🔔</div>
          <h1 style="color:#111;font-size:24px;margin:0;">New Booking!</h1>
        </div>
        <p style="color:#555;">New booking at <strong>${salonName}</strong>.</p>
        <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 12px;color:#111;font-size:14px;">Customer</h3>
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:4px 0;color:#888;">Name</td><td style="padding:4px 0;font-weight:600;">${customerName}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Phone</td><td style="padding:4px 0;">${customerPhone || '—'}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Email</td><td style="padding:4px 0;">${customerEmail || '—'}</td></tr>
          </table>
        </div>
        <div style="background:#fdf2f8;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 12px;color:#111;font-size:14px;">Appointment</h3>
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:4px 0;color:#888;">Service</td><td style="padding:4px 0;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Staff</td><td style="padding:4px 0;font-weight:600;">${staffName}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Date</td><td style="padding:4px 0;font-weight:600;">${date}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Time</td><td style="padding:4px 0;font-weight:600;">${time}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Price</td><td style="padding:4px 0;font-weight:600;">$${price}</td></tr>
            ${notes ? `<tr><td style="padding:4px 0;color:#888;">Notes</td><td style="padding:4px 0;">${notes}</td></tr>` : ''}
          </table>
        </div>
        <div style="text-align:center;margin-top:24px;">
          <a href="${appUrl || 'https://salon-booking.up.railway.app'}/admin" style="display:inline-block;background:#111;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View in Dashboard →</a>
        </div>
      </div>
    </body></html>
  `;
}

module.exports = { sendEmail, bookingConfirmationEmail, shopOwnerNotificationEmail };
