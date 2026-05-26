import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'

const RESET_TIMEOUT = 60000 // 60 seconds
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Pacific/Auckland'

export default function Kiosk() {
  const { slug } = useParams()
  const [screen, setScreen] = useState('welcome') // welcome, search, results, confirmation
  const [salon, setSalon] = useState(null)
  const [input, setInput] = useState('')
  const [inputMode, setInputMode] = useState('phone') // phone or code
  const [appointments, setAppointments] = useState([])
  const [checkedInAppts, setCheckedInAppts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(RESET_TIMEOUT / 1000)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const timerRef = useRef(null)
  const countdownRef = useRef(null)

  // Load salon info
  useEffect(() => {
    fetch(`/api/salons/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setSalon(data)
      })
      .catch(() => setError('Salon not found'))
  }, [slug])

  // Auto-reset timer
  const resetTimer = useCallback(() => {
    clearInterval(countdownRef.current)
    clearTimeout(timerRef.current)
    setCountdown(RESET_TIMEOUT / 1000)

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    timerRef.current = setTimeout(() => {
      // Reset to welcome
      setScreen('welcome')
      setInput('')
      setAppointments([])
      setCheckedInAppts([])
      setError('')
      setShowPrintPreview(false)
    }, RESET_TIMEOUT)
  }, [])

  // Start timer on mount and on any interaction
  useEffect(() => {
    resetTimer()
    return () => {
      clearTimeout(timerRef.current)
      clearInterval(countdownRef.current)
    }
  }, [resetTimer])

  const handleInteraction = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  // Keypad handlers
  const handleKeyPress = (key) => {
    handleInteraction()
    if (key === 'del') {
      setInput(prev => prev.slice(0, -1))
    } else if (key === 'clear') {
      setInput('')
    } else {
      if (inputMode === 'code' && input.length >= 8) return
      if (inputMode === 'phone' && input.length >= 15) return
      setInput(prev => prev + key)
    }
  }

  // Search for appointments
  const handleSearch = async () => {
    if (!input.trim()) return
    handleInteraction()
    setLoading(true)
    setError('')
    try {
      const param = inputMode === 'code'
        ? `code=${input.trim().toUpperCase()}`
        : `phone=${input.trim()}`
      const res = await fetch(`/api/appointments/kiosk/${slug}?${param}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No appointments found')
        setAppointments([])
      } else {
        setAppointments(data)
        if (data.length === 0) {
          setError('No appointments found for today')
        }
        setScreen('results')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // Check in an appointment
  const handleCheckIn = async (appt) => {
    handleInteraction()
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${appt.id}/kiosk-checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Check-in failed')
        setLoading(false)
        return
      }
      // Update local state
      setAppointments(prev =>
        prev.map(a => a.id === appt.id ? { ...a, status: 'checked_in' } : a)
      )
      setCheckedInAppts(prev => [...prev, { ...appt, status: 'checked_in' }])
    } catch (err) {
      alert('Check-in failed. Please try again.')
    }
    setLoading(false)
  }

  // Go to confirmation screen
  const handleDone = () => {
    handleInteraction()
    setScreen('confirmation')
  }

  // Print receipt
  const handlePrint = () => {
    handleInteraction()
    window.print()
  }

  // Format time
  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString('en-NZ', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Number pad keys (phone mode)
  const numKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'del'],
  ]

  // Alpha-numeric keys (code mode) — booking codes use A-Z (no I/O) + 2-9
  const codeKeys = [
    ['1', '2', '3', '4', '5', '6', '7'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ['8', '9', 'clear', 'del', 'P', 'K', 'L'],
  ]

  const activeKeys = inputMode === 'code' ? codeKeys : numKeys

  if (error && !salon) {
    return (
      <div className="kiosk-container">
        <div className="kiosk-error">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-white">{error}</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="kiosk-container" onClick={handleInteraction}>
      {/* Print-only receipt */}
      <div className="print-receipt" id="print-receipt">
        <div className="receipt-content">
          <h1 className="receipt-salon-name">{salon?.name || 'Salon'}</h1>
          {salon?.address && <p className="receipt-address">{salon.address}</p>}
          <div className="receipt-divider">{'='.repeat(40)}</div>
          <p className="receipt-title">CHECK-IN RECEIPT</p>
          <p className="receipt-date">{new Date().toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="receipt-time">{new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}</p>
          <div className="receipt-divider">{'-'.repeat(40)}</div>
          {checkedInAppts.map((appt, i) => (
            <div key={i} className="receipt-item">
              <p className="receipt-service">{appt.service_name}</p>
              <p className="receipt-detail">Staff: {appt.staff_name}</p>
              <p className="receipt-detail">Time: {formatTime(appt.start_time)}</p>
              {appt.customer_name && <p className="receipt-detail">Customer: {appt.customer_name}</p>}
              <div className="receipt-divider">{'-'.repeat(40)}</div>
            </div>
          ))}
          <p className="receipt-thankyou">Thank you for checking in!</p>
          <p className="receipt-footer">Please take a seat and wait to be called.</p>
          <div className="receipt-divider">{'='.repeat(40)}</div>
        </div>
      </div>

      {/* Screen content */}
      <div className="kiosk-screen no-print">
        {/* Header with salon name */}
        <div className="kiosk-header">
          <div className="kiosk-logo">
            {salon?.logo_url ? (
              <img src={salon.logo_url} alt={salon.name} className="kiosk-logo-img" />
            ) : (
              <div className="kiosk-logo-placeholder">💅</div>
            )}
          </div>
          <h1 className="kiosk-salon-name">{salon?.name || 'Loading...'}</h1>
          <div className="kiosk-timer">
            <span className="kiosk-timer-icon">⏱</span>
            <span className="kiosk-timer-text">{countdown}s</span>
          </div>
        </div>

        {/* Welcome Screen */}
        {screen === 'welcome' && (
          <div className="kiosk-welcome">
            <div className="kiosk-welcome-content">
              <h2 className="kiosk-welcome-title">Welcome!</h2>
              <p className="kiosk-welcome-subtitle">Check in for your appointment</p>
              <button
                className="kiosk-checkin-btn"
                onClick={() => { setScreen('search'); handleInteraction(); }}
              >
                <span className="kiosk-checkin-icon">✓</span>
                CHECK IN
              </button>
            </div>
          </div>
        )}

        {/* Search Screen */}
        {screen === 'search' && (
          <div className="kiosk-search">
            <div className="kiosk-search-header">
              <button className="kiosk-back-btn" onClick={() => { setScreen('welcome'); handleInteraction(); }}>
                ← Back
              </button>
              <h2 className="kiosk-search-title">
                {inputMode === 'phone' ? 'Enter your phone number' : 'Enter booking code'}
              </h2>
            </div>

            {/* Toggle phone/code */}
            <div className="kiosk-toggle">
              <button
                className={`kiosk-toggle-btn ${inputMode === 'phone' ? 'active' : ''}`}
                onClick={() => { setInputMode('phone'); setInput(''); handleInteraction(); }}
              >
                📱 Phone
              </button>
              <button
                className={`kiosk-toggle-btn ${inputMode === 'code' ? 'active' : ''}`}
                onClick={() => { setInputMode('code'); setInput(''); handleInteraction(); }}
              >
                🔑 Code
              </button>
            </div>

            {/* Input display */}
            <div className="kiosk-input-display">
              <span className="kiosk-input-value">
                {inputMode === 'phone' ? (
                  input || 'Enter phone number...'
                ) : (
                  input || 'Enter booking code...'
                )}
              </span>
              {input.length > 0 && (
                <span className="kiosk-input-cursor">|</span>
              )}
            </div>

            {/* Keypad */}
            <div className={`kiosk-numpad ${inputMode === 'code' ? 'kiosk-numpad-alpha' : ''}`}>
              {activeKeys.map((row, ri) => (
                <div key={ri} className="kiosk-numpad-row">
                  {row.map(key => (
                    <button
                      key={key}
                      className={`kiosk-numpad-key ${key === 'del' ? 'kiosk-key-action' : ''} ${key === 'clear' ? 'kiosk-key-action' : ''}`}
                      onClick={() => handleKeyPress(key)}
                    >
                      {key === 'del' ? '⌫' : key === 'clear' ? 'C' : key}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Search button */}
            <button
              className="kiosk-search-btn"
              onClick={handleSearch}
              disabled={!input.trim() || loading}
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>

            {error && (
              <div className="kiosk-error-msg">{error}</div>
            )}
          </div>
        )}

        {/* Results Screen */}
        {screen === 'results' && (
          <div className="kiosk-results">
            <div className="kiosk-results-header">
              <button className="kiosk-back-btn" onClick={() => { setScreen('search'); setError(''); handleInteraction(); }}>
                ← Back
              </button>
              <h2 className="kiosk-results-title">
                {inputMode === 'code'
                  ? `${appointments.length} appointment found`
                  : `${appointments.length} upcoming appointment${appointments.length !== 1 ? 's' : ''}`
                }
              </h2>
            </div>

            <div className="kiosk-appt-list">
              {appointments.map(appt => (
                <div key={appt.id} className={`kiosk-appt-card ${appt.status === 'checked_in' ? 'kiosk-appt-checked' : ''}`}>
                  <div className="kiosk-appt-info">
                    <div className="kiosk-appt-time">
                      {(() => {
                        const apptDate = new Date(appt.start_time).toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
                        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
                        if (apptDate !== today) {
                          return <>
                            <span className="kiosk-appt-date">{new Date(appt.start_time).toLocaleDateString('en-NZ', { timeZone: 'Pacific/Auckland', weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span>{formatTime(appt.start_time)}</span>
                          </>;
                        }
                        return formatTime(appt.start_time);
                      })()}
                    </div>
                    <div className="kiosk-appt-service">{appt.service_name}</div>
                    <div className="kiosk-appt-staff">with {appt.staff_name}</div>
                    {appt.customer_name && (
                      <div className="kiosk-appt-customer">{appt.customer_name}</div>
                    )}
                  </div>
                  <div className="kiosk-appt-action">
                    {appt.status === 'checked_in' ? (
                      <div className="kiosk-checked-badge">
                        <span className="kiosk-checked-icon">✓</span>
                        Checked In
                      </div>
                    ) : appt.status === 'confirmed' ? (
                      <button
                        className="kiosk-checkin-appt-btn"
                        onClick={() => handleCheckIn(appt)}
                        disabled={loading}
                      >
                        Check In
                      </button>
                    ) : (
                      <div className="kiosk-status-badge">{appt.status}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {checkedInAppts.length > 0 && (
              <button className="kiosk-done-btn" onClick={handleDone}>
                ✓ Done — View Receipt
              </button>
            )}
          </div>
        )}

        {/* Confirmation Screen */}
        {screen === 'confirmation' && (
          <div className="kiosk-confirmation">
            <div className="kiosk-success-animation">
              <div className="kiosk-success-circle">
                <span className="kiosk-success-check">✓</span>
              </div>
            </div>
            <h2 className="kiosk-confirm-title">You're Checked In!</h2>
            <p className="kiosk-confirm-subtitle">Please take a seat and wait to be called</p>

            <div className="kiosk-receipt-preview">
              <h3 className="kiosk-receipt-heading">📋 Your Services</h3>
              {checkedInAppts.map((appt, i) => (
                <div key={i} className="kiosk-receipt-item">
                  <div className="kiosk-receipt-service">{appt.service_name}</div>
                  <div className="kiosk-receipt-detail">
                    {appt.staff_name} · {formatTime(appt.start_time)}
                  </div>
                </div>
              ))}
            </div>

            <div className="kiosk-confirm-actions">
              <button className="kiosk-print-btn" onClick={handlePrint}>
                🖨 Print Receipt
              </button>
              <button className="kiosk-preview-btn" onClick={() => setShowPrintPreview(true)}>
                👁 Preview Receipt
              </button>
              <button className="kiosk-new-btn" onClick={() => {
                setScreen('welcome')
                setInput('')
                setAppointments([])
                setCheckedInAppts([])
                setError('')
                handleInteraction()
              }}>
                New Check-in
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="kiosk-modal-overlay" onClick={() => setShowPrintPreview(false)}>
          <div className="kiosk-modal" onClick={e => e.stopPropagation()}>
            <div className="kiosk-modal-header">
              <h3>Receipt Preview</h3>
              <button className="kiosk-modal-close" onClick={() => setShowPrintPreview(false)}>✕</button>
            </div>
            <div className="kiosk-modal-body">
              <div className="receipt-preview-paper">
                <div className="receipt-preview-content">
                  <h1 className="receipt-salon-name">{salon?.name || 'Salon'}</h1>
                  {salon?.address && <p className="receipt-address">{salon.address}</p>}
                  <div className="receipt-divider">{'='.repeat(32)}</div>
                  <p className="receipt-title">CHECK-IN RECEIPT</p>
                  <p className="receipt-date">{new Date().toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="receipt-time">{new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}</p>
                  <div className="receipt-divider">{'-'.repeat(32)}</div>
                  {checkedInAppts.map((appt, i) => (
                    <div key={i}>
                      <p className="receipt-service">{appt.service_name}</p>
                      <p className="receipt-detail">Staff: {appt.staff_name}</p>
                      <p className="receipt-detail">Time: {formatTime(appt.start_time)}</p>
                      {appt.customer_name && <p className="receipt-detail">Customer: {appt.customer_name}</p>}
                      <div className="receipt-divider">{'-'.repeat(32)}</div>
                    </div>
                  ))}
                  <p className="receipt-thankyou">Thank you for checking in!</p>
                  <p className="receipt-footer">Please take a seat and wait to be called.</p>
                  <div className="receipt-divider">{'='.repeat(32)}</div>
                </div>
              </div>
            </div>
            <div className="kiosk-modal-footer">
              <button className="kiosk-print-btn" onClick={handlePrint}>🖨 Print</button>
              <button className="kiosk-modal-close-btn" onClick={() => setShowPrintPreview(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Kiosk Styles */}
      <style>{`
        /* === Kiosk Base === */
        .kiosk-container {
          position: fixed;
          inset: 0;
          background: #1a1a2e;
          color: #ffffff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .kiosk-screen {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 480px;
          margin: 0 auto;
          padding: 16px;
        }

        .kiosk-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        /* === Header === */
        .kiosk-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 16px;
        }

        .kiosk-logo-img {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          object-fit: cover;
        }

        .kiosk-logo-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #e91e8c, #9c27b0);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .kiosk-salon-name {
          font-size: 20px;
          font-weight: 700;
          flex: 1;
          background: linear-gradient(135deg, #ff6b9d, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .kiosk-timer {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.08);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }

        .kiosk-timer-icon {
          font-size: 14px;
        }

        /* === Welcome Screen === */
        .kiosk-welcome {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kiosk-welcome-content {
          text-align: center;
          animation: fadeIn 0.5s ease;
        }

        .kiosk-welcome-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #ff6b9d, #c084fc, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .kiosk-welcome-subtitle {
          font-size: 18px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 48px;
        }

        .kiosk-checkin-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 280px;
          height: 80px;
          margin: 0 auto;
          background: linear-gradient(135deg, #e91e8c, #9c27b0);
          color: white;
          border: none;
          border-radius: 24px;
          font-size: 28px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 32px rgba(233, 30, 140, 0.4);
        }

        .kiosk-checkin-btn:active {
          transform: scale(0.96);
          box-shadow: 0 4px 16px rgba(233, 30, 140, 0.3);
        }

        .kiosk-checkin-icon {
          font-size: 32px;
        }

        /* === Search Screen === */
        .kiosk-search {
          flex: 1;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
        }

        .kiosk-search-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .kiosk-back-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: rgba(255,255,255,0.7);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .kiosk-back-btn:active {
          background: rgba(255,255,255,0.2);
        }

        .kiosk-search-title {
          font-size: 18px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
        }

        /* Toggle */
        .kiosk-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .kiosk-toggle-btn {
          flex: 1;
          padding: 12px;
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .kiosk-toggle-btn.active {
          border-color: #e91e8c;
          background: rgba(233, 30, 140, 0.15);
          color: #ff6b9d;
        }

        /* Input display */
        .kiosk-input-display {
          background: rgba(255,255,255,0.06);
          border: 2px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 12px;
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 2px;
          font-family: 'SF Mono', 'Fira Code', monospace;
        }

        .kiosk-input-value {
          color: #ffffff;
        }

        .kiosk-input-cursor {
          color: #e91e8c;
          animation: blink 1s infinite;
        }

        /* Number pad */
        .kiosk-numpad {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          flex: 1;
        }

        .kiosk-numpad-row {
          display: flex;
          gap: 8px;
          flex: 1;
        }

        .kiosk-numpad-key {
          flex: 1;
          min-height: 52px;
          border: none;
          border-radius: 14px;
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          font-size: 22px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kiosk-numpad-alpha .kiosk-numpad-key {
          min-height: 44px;
          font-size: 17px;
          border-radius: 10px;
        }

        .kiosk-numpad-key:active {
          background: rgba(255,255,255,0.2);
          transform: scale(0.95);
        }

        .kiosk-key-action {
          background: rgba(233, 30, 140, 0.15);
          color: #ff6b9d;
          font-size: 18px;
        }

        /* Search button */
        .kiosk-search-btn {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #e91e8c, #9c27b0);
          color: white;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(233, 30, 140, 0.3);
        }

        .kiosk-search-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        .kiosk-search-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .kiosk-error-msg {
          text-align: center;
          color: #ff6b6b;
          margin-top: 12px;
          font-size: 15px;
          padding: 10px;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 12px;
        }

        /* === Results Screen === */
        .kiosk-results {
          flex: 1;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
          overflow: hidden;
        }

        .kiosk-results-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .kiosk-results-title {
          font-size: 18px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
        }

        .kiosk-appt-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 16px;
          -webkit-overflow-scrolling: touch;
        }

        .kiosk-appt-card {
          background: rgba(255,255,255,0.06);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: all 0.3s;
        }

        .kiosk-appt-checked {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .kiosk-appt-time {
          font-size: 24px;
          font-weight: 700;
          color: #ff6b9d;
          margin-bottom: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .kiosk-appt-date {
          font-size: 13px;
          font-weight: 600;
          color: #fbbf24;
          background: rgba(251, 191, 36, 0.15);
          padding: 2px 8px;
          border-radius: 6px;
        }

        .kiosk-appt-service {
          font-size: 17px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .kiosk-appt-staff {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
        }

        .kiosk-appt-customer {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
        }

        .kiosk-checkin-appt-btn {
          padding: 14px 24px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
          white-space: nowrap;
        }

        .kiosk-checkin-appt-btn:active {
          transform: scale(0.95);
        }

        .kiosk-checked-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 14px;
          color: #10b981;
          font-weight: 700;
          font-size: 15px;
        }

        .kiosk-checked-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .kiosk-status-badge {
          padding: 10px 16px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          text-transform: capitalize;
        }

        .kiosk-done-btn {
          width: 100%;
          height: 60px;
          border: none;
          border-radius: 18px;
          background: linear-gradient(135deg, #e91e8c, #9c27b0);
          color: white;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(233, 30, 140, 0.3);
        }

        .kiosk-done-btn:active {
          transform: scale(0.98);
        }

        /* === Confirmation Screen === */
        .kiosk-confirmation {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          animation: fadeIn 0.5s ease;
          padding: 20px 0;
        }

        .kiosk-success-animation {
          margin-bottom: 24px;
        }

        .kiosk-success-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
        }

        .kiosk-success-check {
          font-size: 48px;
          color: white;
          font-weight: 700;
        }

        .kiosk-confirm-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #10b981, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .kiosk-confirm-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 28px;
        }

        .kiosk-receipt-preview {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 24px;
          text-align: left;
        }

        .kiosk-receipt-heading {
          font-size: 16px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          margin-bottom: 16px;
        }

        .kiosk-receipt-item {
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .kiosk-receipt-item:last-child {
          border-bottom: none;
        }

        .kiosk-receipt-service {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .kiosk-receipt-detail {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }

        .kiosk-confirm-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .kiosk-print-btn {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #e91e8c, #9c27b0);
          color: white;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .kiosk-print-btn:active {
          transform: scale(0.98);
        }

        .kiosk-preview-btn {
          width: 100%;
          height: 50px;
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          background: transparent;
          color: rgba(255,255,255,0.7);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .kiosk-preview-btn:active {
          background: rgba(255,255,255,0.08);
        }

        .kiosk-new-btn {
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 16px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .kiosk-new-btn:active {
          background: rgba(255,255,255,0.15);
        }

        /* === Modal === */
        .kiosk-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .kiosk-modal {
          background: #1e1e3a;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .kiosk-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 12px;
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
        }

        .kiosk-modal-close {
          background: rgba(255,255,255,0.1);
          border: none;
          color: rgba(255,255,255,0.6);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kiosk-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px;
        }

        .kiosk-modal-footer {
          display: flex;
          gap: 8px;
          padding: 16px 20px;
        }

        .kiosk-modal-close-btn {
          flex: 1;
          height: 48px;
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          background: transparent;
          color: rgba(255,255,255,0.7);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Receipt Preview Paper */
        .receipt-preview-paper {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          color: #000;
          font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 12px;
        }

        .receipt-preview-content {
          text-align: center;
        }

        .receipt-preview-content .receipt-salon-name {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px;
        }

        .receipt-preview-content .receipt-address {
          font-size: 10px;
          color: #666;
          margin: 0 0 8px;
        }

        .receipt-preview-content .receipt-title {
          font-size: 13px;
          font-weight: 700;
          margin: 8px 0;
        }

        .receipt-preview-content .receipt-date,
        .receipt-preview-content .receipt-time {
          font-size: 11px;
          color: #333;
          margin: 2px 0;
        }

        .receipt-preview-content .receipt-divider {
          font-size: 10px;
          color: #999;
          margin: 8px 0;
          letter-spacing: 1px;
          overflow: hidden;
          white-space: nowrap;
        }

        .receipt-preview-content .receipt-service {
          font-size: 13px;
          font-weight: 700;
          margin: 6px 0 2px;
          text-align: left;
        }

        .receipt-preview-content .receipt-detail {
          font-size: 11px;
          color: #555;
          margin: 1px 0;
          text-align: left;
        }

        .receipt-preview-content .receipt-thankyou {
          font-size: 13px;
          font-weight: 700;
          margin: 12px 0 4px;
        }

        .receipt-preview-content .receipt-footer {
          font-size: 10px;
          color: #666;
          margin: 0;
        }

        /* === Animations === */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* === Print Styles === */
        .print-receipt {
          display: none;
        }

        @media print {
          /* Hide everything except receipt */
          body * {
            visibility: hidden !important;
          }

          .print-receipt,
          .print-receipt * {
            visibility: visible !important;
          }

          .print-receipt {
            display: block !important;
            position: fixed;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #000;
            background: #fff;
          }

          .no-print {
            display: none !important;
          }

          .receipt-salon-name {
            font-size: 16px;
            font-weight: 700;
            text-align: center;
            margin: 0 0 4px;
          }

          .receipt-address {
            font-size: 10px;
            text-align: center;
            color: #666;
            margin: 0 0 8px;
          }

          .receipt-title {
            font-size: 14px;
            font-weight: 700;
            text-align: center;
            margin: 8px 0;
          }

          .receipt-date,
          .receipt-time {
            font-size: 11px;
            text-align: center;
            color: #333;
            margin: 2px 0;
          }

          .receipt-divider {
            font-size: 10px;
            color: #999;
            margin: 6px 0;
            text-align: center;
            letter-spacing: 1px;
          }

          .receipt-item {
            margin: 6px 0;
          }

          .receipt-service {
            font-size: 13px;
            font-weight: 700;
            margin: 4px 0 2px;
          }

          .receipt-detail {
            font-size: 11px;
            color: #555;
            margin: 1px 0;
          }

          .receipt-thankyou {
            font-size: 13px;
            font-weight: 700;
            text-align: center;
            margin: 10px 0 4px;
          }

          .receipt-footer {
            font-size: 10px;
            text-align: center;
            color: #666;
            margin: 0;
          }

          @page {
            size: 80mm auto;
            margin: 0;
          }
        }

        /* === Landscape warning (optional) === */
        @media (orientation: landscape) and (max-height: 500px) {
          .kiosk-container::before {
            content: 'Please rotate your device to portrait mode';
            position: fixed;
            inset: 0;
            background: #1a1a2e;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            z-index: 9999;
            text-align: center;
            padding: 20px;
          }
        }

        /* Scrollbar styling for kiosk */
        .kiosk-appt-list::-webkit-scrollbar {
          width: 4px;
        }
        .kiosk-appt-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .kiosk-appt-list::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
        }
      `}</style>
    </div>
  )
}
