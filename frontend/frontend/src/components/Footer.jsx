import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">TaskFlow</h3>
          <p className="footer-desc">
            A simple and powerful project management tool to plan, track, and
            deliver work efficiently.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/dashboard" className="text-reset text-decoration-none">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/boards" className="text-reset text-decoration-none">
                Boards
              </Link>
            </li>
            <li>
              <Link to="/tasks" className="text-reset text-decoration-none">
                Tasks
              </Link>
            </li>
            <li>
              <Link to="/team" className="text-reset text-decoration-none">
                Team
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li>
              <Link to="/docs" className="text-reset text-decoration-none">
                Documentation
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-reset text-decoration-none">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/api" className="text-reset text-decoration-none">
                API Reference
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li>
              <Link to="/privacy" className="text-reset text-decoration-none">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-reset text-decoration-none">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-reset text-decoration-none">
                Contact Support
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} TaskFlow. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
