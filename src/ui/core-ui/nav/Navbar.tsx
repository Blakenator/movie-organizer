import React from 'react';
import { Link } from 'react-router-dom';

const routes = [
  { link: '/main_window', label: 'Home' },
  { link: '/tv', label: 'TV Shows' },
];

export const Navbar: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1em',
        padding: '.5em',
      }}
    >
      {routes.map(({ link, label }) => (
        <Link className="btn btn-secondary" to={link}>
          {label}
        </Link>
      ))}
    </div>
  );
};
