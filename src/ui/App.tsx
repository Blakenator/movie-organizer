import React from 'react';
import { render } from 'react-dom';

import './app.scss';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/routes';
import { Navbar } from './core-ui/nav/Navbar';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
};

render(<App />, document.getElementById('app'));
