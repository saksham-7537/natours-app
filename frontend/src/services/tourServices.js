import api from "./api";

export const fetchTours = async () => {
  const res = await api.get('/tours');
  return res.data.data.tours;
};

export const fetchTour = async (slug) => {
  const res = await api.get(`/tours/slug/${slug}`);
  return res.data.data.tour;
};
