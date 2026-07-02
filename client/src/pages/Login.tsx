import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import loginBanner from "../assets/banner/login_grocery_banner.png"

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLoginState, setIsLoginState] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLoginState) {
        const profile = await login(email, password);
        toast.success(`Welcome back, ${profile.name}!`);
        if (profile.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const profile = await register(name, email, password);
        toast.success(`Account created successfully! Welcome, ${profile.name}.`);
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        {/* left side */}
        <div className="left-side">
          <img src={loginBanner} alt="Organic Grocery" className="banner-img" />
          <div className="left-overlay"></div>
          <div className="login-text">
            <h2>Welcome to crosmart</h2>
            <p>Fresh groceries & organic food delivered directly to your doorstep.</p>
          </div>
        </div>

        {/* right side */}
        <div className="right-side">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-header">
              <h1>{isLoginState ? "Sign In" : "Create Account"}</h1>
              <p>{isLoginState ? "Access your premium grocery experience" : "Register to start shopping fresh organic goods"}</p>
            </div>

            {!isLoginState && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input type="text" id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <input type="email" id="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                isLoginState ? "Sign In" : "Sign Up"
              )}
            </button>

            <div className="auth-toggle">
              <span>{isLoginState ? "Don't have an account?" : "Already have an account?"}</span>
              <button type="button" className="toggle-link" onClick={() => setIsLoginState(!isLoginState)}>
                {isLoginState ? "Sign up here" : "Log in here"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login