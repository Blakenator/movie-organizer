import React from 'react';
import { useLocation } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const location = useLocation();
  return <>Page not found: {location.pathname}</>;
};
