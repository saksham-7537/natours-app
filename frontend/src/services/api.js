const API_URL = "http://localhost:8000/api/v1";

const fetchTours = async () => { 
  const res = await fetch(`${API_URL}/tours`);
  if (!res.ok) throw new Error("could not fetch tours");
  const data = await res.json();
  return data.data.tours;
};

const fetchTour = async (slug) => {
  const res = await fetch(`${API_URL}/tours/slug/${slug}`);
  const json = await res.json();
  return json.data.tour;
};

export { fetchTours, fetchTour };
