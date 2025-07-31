import React from 'react';

export const MovieMeter: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://www.imdb.com/chart/moviemeter"
        className="w-full h-full border-0"
        title="IMDb Movie Meter"
      ></iframe>
    </div>
  );
};
