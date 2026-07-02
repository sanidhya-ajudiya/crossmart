import { useState } from "react"
import { MailIcon, Send } from "lucide-react"
import { toast } from "react-hot-toast"

const NewsLetter = () => {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (email.trim()) {
      toast.success(`Subscribed successfully with ${email}!`, {
        icon: '✉️',
        style: {
          borderRadius: '10px',
          background: 'var(--card-bg)',
          color: 'var(--text-primary)',
        }
      })
      setEmail("")
    }
  }

  return (
    <section className="newsletter-wrapper">
      <div className="newsletter-section">
        <div className="newsletter-content">
          <div className="newsletter-icon-box">
            <MailIcon className="newsletter-icon" size={32} />
          </div>
          <h2 className="newsletter-title">Subscribe to our Newsletter</h2>
          <p className="newsletter-desc">
            Stay updated with our latest organic arrivals, healthy recipes, and exclusive community discounts.
          </p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <MailIcon className="input-mail-icon" size={18} />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="subscribe-btn">
              <span>Subscribe</span>
              <Send size={14} className="send-icon" />
            </button>
          </form>
        </div>
      </div>  
    </section>
  )
}

export default NewsLetter