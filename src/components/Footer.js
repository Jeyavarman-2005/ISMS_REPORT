import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} Admin Portal. All rights reserved.</p>
    </footer>
  );
};

export default Footer;