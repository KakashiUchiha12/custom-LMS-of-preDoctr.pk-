import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  return (
    <div className="login-page">
      <div className="login-card fade-in-up">
        <div className="login-brand">
          <img src="https://predoctr.pk/favicon/cropped-Blue-Stethoscope-Medical-Logo-3-1-1.png" alt="Logo" />
          <h2>pre<span>Doctr.pk</span></h2>
        </div>
        
        <div className="login-content">
          <h1>Student Sign In</h1>
          <p>Access your lectures, practice tests, and track your MDCAT preparation progress.</p>
          
          <button className="google-login-btn" onClick={loginWithGoogle}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Sign in with Google
          </button>
          
          <p className="login-footer">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
