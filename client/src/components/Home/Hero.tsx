import { ArrowRightIcon, LeafIcon } from "lucide-react"
import { Link } from "react-router-dom"
import heroBg from "../../assets/banner/hero_bg.png"

const Hero = () => {
  return (
    <section className="hero-section">
      <img src={heroBg} alt="Hero" className="hero-image" />
      <div className="hero-overlay" />
      <div className="hero-content">
       <div className="hero-text"> 
        <span className="hero-badge">
          <LeafIcon className="hero-badge-icon" />
          Farm Fresh Produce Delivered Daily
        </span>
        <h1 className="hero-title">
          Nourish your home with <span className="hero-accent">Earth's finest</span>  
        </h1>
        <p className="hero-desc">
          Experience the difference of farm-to-table quality. Handpicked 
        </p>

        <div className="hero-buttons">
          <Link to="/products" className="shop-btn primary-btn">
             Shop Now <ArrowRightIcon size={18} />
          </Link>

          <Link to="/products" className="shop-btn secondary-btn">
             Browse Categories <ArrowRightIcon size={18} />
          </Link>  
        </div>
       </div> 
      </div>  
    </section>
  )
}

export default Hero