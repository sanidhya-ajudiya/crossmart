import { Link } from "react-router-dom";
import { MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "@icons-pack/react-simple-icons";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-wrapper">
        <div className="footer-logo">
          <div>
            <Link to="/" className="footer-brand">
              <span className="logo-accent">cro</span>smart
            </Link>
          </div>
          <p className="footer-description">
            Bringing fresh, organic groceries straight from local farms to your doorstep. Nourish your home with Earth's finest.
          </p>
          <div className="footer-social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <SiFacebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <SiInstagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <SiX size={20} />
            </a>
          </div>
        </div>

        <div className="footer-content">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/products">All products</Link></li>
              <li><Link to="/deals">Flash Deals</Link></li>
              <li><Link to="/orders">Track Order</Link></li>
              <li><Link to="/delivery">Delivery Partner</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Customer Services</h4>
            <ul>
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/login">Order History</Link></li>
              <li><Link to="/register">Address</Link></li>
              <li><Link to="/contact">Help Center</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Contact Us</h4>
            <ul>
              <li className="footer-contact-item">
                <MapPinIcon size={16} />
                <span>123 Farm House Lane, Organic Valley</span>
              </li>
              <li className="footer-contact-item">
                <PhoneIcon size={16} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="footer-contact-item">
                <MailIcon size={16} />
                <span>support@crosmart.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Crosmart. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;