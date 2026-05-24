const fetch = require('node-fetch');
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@timia.nz';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

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
      console.error(`[EMAIL] ❌ Error ${res.status}: ${JSON.stringify(data)}`);
      return { error: data.message || JSON.stringify(data), status: res.status };
    }
  } catch (err) {
    console.error(`[EMAIL] ❌ Fetch error: ${err.message}`);
    return null;
  }
}

function bookingConfirmationEmail({ customerName, salonName, serviceName, staffName, date, time, duration, price, address, bookingCode }) {
  customerName = escapeHtml(customerName); salonName = escapeHtml(salonName); serviceName = escapeHtml(serviceName); staffName = escapeHtml(staffName); address = escapeHtml(address); bookingCode = escapeHtml(bookingCode);
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
        ${bookingCode ? `
        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:16px;margin:24px 0;text-align:center;">
          <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Booking Code</div>
          <div style="font-size:28px;font-weight:700;color:#16a34a;letter-spacing:3px;">${bookingCode}</div>
          <div style="font-size:12px;color:#888;margin-top:4px;">Use this code or your phone number to look up your booking</div>
        </div>` : ''}
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
  salonName = escapeHtml(salonName); customerName = escapeHtml(customerName); customerPhone = escapeHtml(customerPhone); customerEmail = escapeHtml(customerEmail); serviceName = escapeHtml(serviceName); staffName = escapeHtml(staffName); notes = escapeHtml(notes);
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
          <a href="${appUrl || 'https://www.timia.nz'}/admin" style="display:inline-block;background:#111;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View in Dashboard →</a>
        </div>
      </div>
    </body></html>
  `;
}

function cancellationEmail({ customerName, salonName, serviceName, staffName, date, time }) {
  customerName = escapeHtml(customerName); salonName = escapeHtml(salonName); serviceName = escapeHtml(serviceName); staffName = escapeHtml(staffName);
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">❌</div>
          <h1 style="color:#111;font-size:24px;margin:0;">Booking Cancelled</h1>
        </div>
        <p style="color:#555;font-size:16px;">Hi ${customerName},</p>
        <p style="color:#555;">Your appointment at <strong>${salonName}</strong> has been cancelled.</p>
        <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:24px 0;">
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:6px 0;color:#888;">Service</td><td style="padding:6px 0;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Staff</td><td style="padding:6px 0;font-weight:600;">${staffName}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;font-weight:600;">${date}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Time</td><td style="padding:6px 0;font-weight:600;">${time}</td></tr>
          </table>
        </div>
        <p style="color:#888;font-size:13px;margin-top:32px;text-align:center;">If this was a mistake, please book again.</p>
      </div>
    </body></html>
  `;
}

function cancellationOwnerEmail({ salonName, customerName, customerPhone, serviceName, staffName, date, time }) {
  salonName = escapeHtml(salonName); customerName = escapeHtml(customerName); customerPhone = escapeHtml(customerPhone); serviceName = escapeHtml(serviceName); staffName = escapeHtml(staffName);
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">❌</div>
          <h1 style="color:#111;font-size:24px;margin:0;">Booking Cancelled</h1>
        </div>
        <p style="color:#555;">A booking at <strong>${salonName}</strong> has been cancelled by the customer.</p>
        <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 12px;color:#111;font-size:14px;">Customer</h3>
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:4px 0;color:#888;">Name</td><td style="padding:4px 0;font-weight:600;">${customerName}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Phone</td><td style="padding:4px 0;">${customerPhone || '—'}</td></tr>
          </table>
        </div>
        <div style="background:#fdf2f8;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 12px;color:#111;font-size:14px;">Cancelled Appointment</h3>
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:4px 0;color:#888;">Service</td><td style="padding:4px 0;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Staff</td><td style="padding:4px 0;font-weight:600;">${staffName}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Date</td><td style="padding:4px 0;font-weight:600;">${date}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Time</td><td style="padding:4px 0;font-weight:600;">${time}</td></tr>
          </table>
        </div>
      </div>
    </body></html>
  `;
}

function rescheduleEmail({ customerName, salonName, serviceName, staffName, oldDate, oldTime, newDate, newTime }) {
  customerName = escapeHtml(customerName); salonName = escapeHtml(salonName); serviceName = escapeHtml(serviceName); staffName = escapeHtml(staffName);
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">🔄</div>
          <h1 style="color:#111;font-size:24px;margin:0;">Booking Rescheduled</h1>
        </div>
        <p style="color:#555;font-size:16px;">Hi ${customerName},</p>
        <p style="color:#555;">Your appointment at <strong>${salonName}</strong> has been rescheduled.</p>
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px;margin:24px 0;">
          <div style="font-size:12px;color:#888;text-transform:uppercase;margin-bottom:8px;">Previous</div>
          <div style="font-size:14px;color:#666;">${oldDate} at ${oldTime}</div>
        </div>
        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:16px;margin:24px 0;">
          <div style="font-size:12px;color:#888;text-transform:uppercase;margin-bottom:8px;">New Time</div>
          <div style="font-size:18px;font-weight:700;color:#16a34a;">${newDate}</div>
          <div style="font-size:16px;font-weight:600;color:#16a34a;">${newTime}</div>
        </div>
        <div style="background:#fdf2f8;border-radius:8px;padding:20px;margin:24px 0;">
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:6px 0;color:#888;">Service</td><td style="padding:6px 0;font-weight:600;">${serviceName}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Staff</td><td style="padding:6px 0;font-weight:600;">${staffName}</td></tr>
          </table>
        </div>
        <p style="color:#888;font-size:13px;margin-top:32px;text-align:center;">We look forward to seeing you at the new time!</p>
      </div>
    </body></html>
  `;
}

function reminderEmail({ customerName, salonName, serviceName, staffName, date, time, duration, price, address, bookingCode }) {
  customerName = escapeHtml(customerName); salonName = escapeHtml(salonName); serviceName = escapeHtml(serviceName); staffName = escapeHtml(staffName); address = escapeHtml(address); bookingCode = escapeHtml(bookingCode);
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">⏰</div>
          <h1 style="color:#111;font-size:24px;margin:0;">Appointment Reminder</h1>
        </div>
        <p style="color:#555;font-size:16px;">Hi ${customerName},</p>
        <p style="color:#555;">This is a friendly reminder that you have an appointment at <strong>${salonName}</strong> tomorrow!</p>
        ${bookingCode ? `
        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:16px;margin:24px 0;text-align:center;">
          <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Booking Code</div>
          <div style="font-size:28px;font-weight:700;color:#16a34a;letter-spacing:3px;">${bookingCode}</div>
        </div>` : ''}
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

function reviewRequestEmail({ customerName, salonName, serviceName, date, bookingCode }) {
  customerName = escapeHtml(customerName); salonName = escapeHtml(salonName); serviceName = escapeHtml(serviceName); bookingCode = escapeHtml(bookingCode);
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">⭐</div>
          <h1 style="color:#111;font-size:24px;margin:0;">How was your visit?</h1>
        </div>
        <p style="color:#555;font-size:16px;">Hi ${customerName},</p>
        <p style="color:#555;">Thank you for visiting <strong>${salonName}</strong>! We hope you enjoyed your ${serviceName} on ${date}.</p>
        <p style="color:#555;">We'd love to hear about your experience. Your feedback helps us improve!</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.timia.nz/lookup?code=${bookingCode}" style="display:inline-block;background:#ec4899;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Leave a Review ⭐</a>
        </div>
        <p style="color:#888;font-size:13px;margin-top:32px;text-align:center;">Thank you for choosing ${salonName}!</p>
      </div>
    </body></html>
  `;
}

function newShopNotificationEmail({ salonName, slug, ownerName, email, phone, address, website }) {
  salonName = escapeHtml(salonName); slug = escapeHtml(slug); ownerName = escapeHtml(ownerName); email = escapeHtml(email); phone = escapeHtml(phone); address = escapeHtml(address);
  // Validate website URL protocol to prevent javascript: injection in href
  const safeWebsite = website && /^https?:\/\//.test(website) ? escapeHtml(website) : null;
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">🏪</div>
          <h1 style="color:#111;font-size:24px;margin:0;">New Shop Registered!</h1>
        </div>
        <p style="color:#555;">A new shop has just signed up on Timia.</p>
        <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 12px;color:#111;font-size:14px;">Shop Details</h3>
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:4px 0;color:#888;">Name</td><td style="padding:4px 0;font-weight:600;">${salonName}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Slug</td><td style="padding:4px 0;"><a href="https://www.timia.nz/${slug}/book">${slug}</a></td></tr>
            ${address ? `<tr><td style="padding:4px 0;color:#888;">Address</td><td style="padding:4px 0;">${address}</td></tr>` : ''}
            ${phone ? `<tr><td style="padding:4px 0;color:#888;">Phone</td><td style="padding:4px 0;">${phone}</td></tr>` : ''}
            ${safeWebsite ? `<tr><td style="padding:4px 0;color:#888;">Website</td><td style="padding:4px 0;"><a href="${safeWebsite}">${safeWebsite}</a></td></tr>` : ''}
          </table>
        </div>
        <div style="background:#fdf2f8;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 12px;color:#111;font-size:14px;">Owner</h3>
          <table style="width:100%;font-size:14px;color:#333;">
            <tr><td style="padding:4px 0;color:#888;">Name</td><td style="padding:4px 0;font-weight:600;">${ownerName}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Email</td><td style="padding:4px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          </table>
        </div>
        <div style="text-align:center;margin-top:24px;">
          <a href="https://www.timia.nz/admin/shops" style="display:inline-block;background:#111;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View in Admin →</a>
        </div>
      </div>
    </body></html>
  `;
}

function completionEmail({ customerName, salonName, serviceName, date, pointsEarned, totalPoints, stampGoal, stampReward, bookingCode }) {
  customerName = escapeHtml(customerName); salonName = escapeHtml(salonName); serviceName = escapeHtml(serviceName); stampReward = escapeHtml(stampReward); bookingCode = escapeHtml(bookingCode);
  const stamps = Math.min(totalPoints, stampGoal);
  const stampsHtml = Array.from({ length: stampGoal }, (_, i) =>
    `<div style="width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin:2px;font-size:16px;${i < stamps ? 'background:#ec4899;color:white;' : 'background:#f3f4f6;color:#d1d5db;'}">${i < stamps ? '⭐' : '○'}</div>`
  ).join('');
  const progressPercent = Math.min(100, Math.round((stamps / stampGoal) * 100));
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">✨</div>
          <h1 style="color:#111;font-size:24px;margin:0;">Thank You!</h1>
        </div>
        <p style="color:#555;font-size:16px;">Hi ${customerName},</p>
        <p style="color:#555;">Thank you for visiting <strong>${salonName}</strong>! We hope you enjoyed your ${serviceName}.</p>
        ${pointsEarned > 0 ? `
        <div style="background:#fdf2f8;border:2px solid #f9a8d4;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
          <div style="font-size:14px;color:#888;margin-bottom:4px;">Points Earned</div>
          <div style="font-size:36px;font-weight:700;color:#ec4899;">+${pointsEarned}</div>
          <div style="font-size:13px;color:#888;margin-top:4px;">Total: ${totalPoints} points</div>
        </div>
        <div style="background:#fafafa;border-radius:12px;padding:20px;margin:24px 0;">
          <div style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">🎯 Loyalty Progress</div>
          <div style="text-align:center;margin:12px 0;">${stampsHtml}</div>
          <div style="background:#e5e7eb;border-radius:99px;height:8px;margin:12px 0;">
            <div style="background:linear-gradient(90deg,#ec4899,#8b5cf6);height:8px;border-radius:99px;width:${progressPercent}%;transition:width 0.3s;"></div>
          </div>
          <div style="font-size:13px;color:#666;text-align:center;">${stamps}/${stampGoal} — ${stamps >= stampGoal ? '🎉 Ready to redeem!' : `${stampGoal - stamps} more to go!`}</div>
          ${stamps >= stampGoal ? `<div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:12px;margin-top:12px;text-align:center;font-weight:600;color:#16a34a;">🎁 Reward: ${stampReward}</div>` : ''}
        </div>` : ''}
        ${bookingCode ? `
        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:16px;margin:24px 0;text-align:center;">
          <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Booking Code</div>
          <div style="font-size:24px;font-weight:700;color:#16a34a;letter-spacing:3px;">${bookingCode}</div>
        </div>` : ''}
        <div style="text-align:center;margin-top:24px;">
          <p style="color:#888;font-size:13px;">We look forward to seeing you again!</p>
        </div>
      </div>
    </body></html>
  `;
}

function loyaltyReminderEmail({ customerName, salonName, totalPoints, totalVisits, stampGoal, stampReward, availableRewards, bookingUrl, emailTemplate }) {
  customerName = escapeHtml(customerName); salonName = escapeHtml(salonName); stampReward = escapeHtml(stampReward);

  const defaultMsg = `Hi {customerName}, here's your loyalty status at {salonName}! We'd love to see you again soon.`;
  const template = emailTemplate || defaultMsg;
  const customerNameRaw = customerName;
  const salonNameRaw = salonName;
  // Replace placeholders (use escaped values for HTML safety)
  const customMsg = escapeHtml(template)
    .replace(/\{customerName\}/g, customerName)
    .replace(/\{salonName\}/g, salonName)
    .replace(/\{totalPoints\}/g, String(totalPoints))
    .replace(/\{totalVisits\}/g, String(totalVisits || 0))
    .replace(/\{stampGoal\}/g, String(stampGoal))
    .replace(/\{stampReward\}/g, stampReward)
    .replace(/\{bookingUrl\}/g, escapeHtml(bookingUrl || 'https://www.timia.nz'));

  const stamps = Math.min(totalVisits || 0, stampGoal);
  const stampsHtml = Array.from({ length: stampGoal }, (_, i) =>
    `<div style="width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin:2px;font-size:16px;${i < stamps ? 'background:#ec4899;color:white;' : 'background:#f3f4f6;color:#d1d5db;'}">${i < stamps ? '⭐' : '○'}</div>`
  ).join('');
  const progressPercent = Math.min(100, Math.round((stamps / stampGoal) * 100));
  const rewardsHtml = (availableRewards || []).map(r =>
    `<div style="display:flex;justify-content:space-between;align-items:center;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin:6px 0;">
      <span style="font-size:14px;color:#333;">${escapeHtml(r.name)}</span>
      <span style="font-size:13px;font-weight:600;color:#ec4899;">${r.points_cost} pts</span>
    </div>`
  ).join('');
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">⭐</div>
          <h1 style="color:#111;font-size:24px;margin:0;">Your Loyalty Points</h1>
        </div>
        <p style="color:#555;font-size:16px;white-space:pre-line;">${customMsg}</p>
        <div style="background:#fdf2f8;border:2px solid #f9a8d4;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
          <div style="font-size:14px;color:#888;margin-bottom:4px;">Your Points Balance</div>
          <div style="font-size:42px;font-weight:700;color:#ec4899;">${totalPoints}</div>
          <div style="font-size:13px;color:#888;margin-top:4px;">${totalVisits || 0} visits</div>
        </div>
        <div style="background:#fafafa;border-radius:12px;padding:20px;margin:24px 0;">
          <div style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">🎯 Loyalty Progress</div>
          <div style="text-align:center;margin:12px 0;">${stampsHtml}</div>
          <div style="background:#e5e7eb;border-radius:99px;height:8px;margin:12px 0;">
            <div style="background:linear-gradient(90deg,#ec4899,#8b5cf6);height:8px;border-radius:99px;width:${progressPercent}%;"></div>
          </div>
          <div style="font-size:13px;color:#666;text-align:center;">${stamps}/${stampGoal} — ${stamps >= stampGoal ? '🎉 Ready to redeem!' : `${stampGoal - stamps} more visits to go!`}</div>
          ${stamps >= stampGoal ? `<div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:12px;margin-top:12px;text-align:center;font-weight:600;color:#16a34a;">🎁 Reward: ${stampReward}</div>` : ''}
        </div>
        ${rewardsHtml ? `
        <div style="margin:24px 0;">
          <div style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">🎁 Available Rewards</div>
          ${rewardsHtml}
        </div>` : ''}
        <div style="text-align:center;margin-top:28px;">
          <a href="${bookingUrl || 'https://www.timia.nz'}" style="display:inline-block;background:#ec4899;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Book Now 💅</a>
        </div>
        <p style="color:#888;font-size:13px;margin-top:24px;text-align:center;">Thank you for being a loyal customer!</p>
      </div>
    </body></html>
  `;
}

module.exports = { sendEmail, bookingConfirmationEmail, shopOwnerNotificationEmail, cancellationEmail, cancellationOwnerEmail, rescheduleEmail, reminderEmail, reviewRequestEmail, newShopNotificationEmail, completionEmail, loyaltyReminderEmail };
