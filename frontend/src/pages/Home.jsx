import { useEffect, useState } from 'react';
import { fetchTours } from '../services/tourServices.js';
import TourCard from '../components/TourCard';

const Home = () => {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    fetchTours().then(setTours).catch(console.error);
  }, []);

  return (
    <main className="main">
      <div className="card-container">
        {tours.map((tour) => (
          <TourCard key={tour._id} tour={tour} />
        ))}
      </div>
    </main>
  );
};

export default Home;
