import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home } from '../pages/home/Home';
import { TvShows } from '../pages/tv-shows/TvShows';
import { NotFound } from '../pages/not-found/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/main_window" element={<Home />} />
      <Route path="/tv" element={<TvShows />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
