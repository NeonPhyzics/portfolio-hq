import { useState } from 'react'

export default function Login({ sendMagicLink }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setError(null)
    const err = await sendMagicLink(email)
    setSending(false)
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="login-title">Portfolio HQ</h1>
        {sent ? (
          <p className="login-sent">Check your email for the login link.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <button type="submit" className="login-btn" disabled={sending}>
              {sending ? 'Sending…' : 'Send magic link'}
            </button>
            {error && <p className="login-error">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
