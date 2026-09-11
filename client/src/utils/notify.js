/**
 * Toasts and confirmation dialogs.
 *
 * The admin area used 87 native `alert()` and `confirm()` popups. They freeze
 * the page, cannot be styled, and on a phone they look like a browser error
 * ("timia.nz says…") rather than part of the product.
 *
 * Deliberately plain DOM with inline styles rather than React: it can be called
 * from anywhere — event handlers, catch blocks, async functions — without
 * threading a provider through every page, and inline styles are immune to
 * Tailwind's class purging.
 */

const COLORS = {
  success: { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46', icon: '✓' },
  error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '!' },
  info: { bg: '#ffffff', border: '#e5e7eb', text: '#111827', icon: 'i' },
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

let container = null;

function getContainer() {
  if (container && document.body.contains(container)) return container;
  container = document.createElement('div');
  container.setAttribute('data-timia-toasts', '');
  Object.assign(container.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    left: '16px',
    zIndex: '10000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    pointerEvents: 'none',
  });
  document.body.appendChild(container);
  return container;
}

/**
 * Show a transient message.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type]
 * @param {number} [duration] ms; errors linger longer by default
 */
export function toast(message, type = 'info', duration) {
  if (!message) return;
  const style = COLORS[type] || COLORS.info;
  const ms = duration || (type === 'error' ? 6000 : 3500);

  const el = document.createElement('div');
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  Object.assign(el.style, {
    pointerEvents: 'auto',
    maxWidth: '380px',
    background: style.bg,
    border: `1px solid ${style.border}`,
    color: style.text,
    borderRadius: '12px',
    padding: '12px 14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    font: `500 14px/1.45 ${FONT}`,
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    opacity: '0',
    transform: 'translateY(-8px)',
    transition: 'opacity .18s ease, transform .18s ease',
    cursor: 'pointer',
    wordBreak: 'break-word',
  });

  const badge = document.createElement('span');
  badge.textContent = style.icon;
  Object.assign(badge.style, {
    flex: '0 0 auto', width: '18px', height: '18px', borderRadius: '50%',
    background: style.border, color: style.text, fontSize: '12px',
    lineHeight: '18px', textAlign: 'center', fontWeight: '700', marginTop: '1px',
  });

  const text = document.createElement('span');
  text.textContent = String(message);

  el.appendChild(badge);
  el.appendChild(text);
  getContainer().appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  let timer;
  const dismiss = () => {
    clearTimeout(timer);
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 200);
  };
  el.addEventListener('click', dismiss);
  timer = setTimeout(dismiss, ms);

  return dismiss;
}

/**
 * Ask the user to confirm. Replaces window.confirm().
 * @returns {Promise<boolean>} resolves true only if confirmed.
 */
export function confirmDialog(options = {}) {
  const {
    message = '',
    title = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
  } = typeof options === 'string' ? { message: options } : options;

  return new Promise(resolve => {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '10001',
      background: 'rgba(17,24,39,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', opacity: '0', transition: 'opacity .15s ease',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      background: '#fff', borderRadius: '16px', padding: '22px',
      width: '100%', maxWidth: '400px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      font: `400 14px/1.5 ${FONT}`, color: '#374151',
      transform: 'scale(.97)', transition: 'transform .15s ease',
    });

    if (title) {
      const h = document.createElement('div');
      h.textContent = title;
      Object.assign(h.style, { font: `600 16px/1.4 ${FONT}`, color: '#111827', marginBottom: '6px' });
      box.appendChild(h);
    }

    const p = document.createElement('div');
    p.textContent = message;
    p.style.marginBottom = '20px';
    box.appendChild(p);

    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: '8px', justifyContent: 'flex-end' });

    const mkButton = (label, primary) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      Object.assign(b.style, {
        padding: '9px 16px', borderRadius: '10px', cursor: 'pointer',
        font: `600 14px/1 ${FONT}`,
        border: primary ? '1px solid transparent' : '1px solid #e5e7eb',
        background: primary ? (danger ? '#dc2626' : '#db2777') : '#fff',
        color: primary ? '#fff' : '#374151',
      });
      return b;
    };

    const cancel = mkButton(cancelLabel, false);
    const ok = mkButton(confirmLabel, true);
    row.appendChild(cancel);
    row.appendChild(ok);
    box.appendChild(row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      box.style.transform = 'scale(1)';
    });
    ok.focus();

    const close = (result) => {
      document.removeEventListener('keydown', onKey);
      overlay.style.opacity = '0';
      box.style.transform = 'scale(.97)';
      setTimeout(() => overlay.remove(), 160);
      resolve(result);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };

    cancel.addEventListener('click', () => close(false));
    ok.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', onKey);
  });
}
