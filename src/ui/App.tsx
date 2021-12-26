import React from 'react';
import { render } from 'react-dom';

import './app.scss';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/routes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

render(<App />, document.getElementById('app'));
