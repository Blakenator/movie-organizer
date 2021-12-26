import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faHome } from '@fortawesome/free-solid-svg-icons';

export const Home: React.FC = () => {
  return (
    <>
      <FontAwesomeIcon icon={faHome} /> home screen
    </>
  );
};
