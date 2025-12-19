import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTour } from '../services/tourServices.js';
import L from 'leaflet';

const TourDetails = () => {
  const { slug } = useParams();
  const [tour, setTour] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchTour(slug).then(setTour).catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!tour.locations) return;

    const existingMap = document.getElementById('map');
    if (existingMap._leaflet_id) {
      existingMap._leaflet_id = null; // Force reset map on hot-reload or re-render
    }

    // Create map
    const map = L.map('map', {
      zoomControl: false,
      center: [20, 0],
      zoom: 3,
    });

    // 🧭 Set initial center and zoom
    map.setView(
      [tour.locations[0].coordinates[1], tour.locations[0].coordinates[0]],
      6
    );

    // Tile layer (custom theme)
    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    // Custom pin
    const greenIcon = L.icon({
      iconUrl: '/img/pin.png',
      iconSize: [32, 40],
      iconAnchor: [16, 45],
      popupAnchor: [0, -50],
    });

    // Marker setup
    const points = [];

    tour.locations.forEach((loc) => {
      // Create points
      points.push([loc.coordinates[1], loc.coordinates[0]]);

      // Add markers
      L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: greenIcon })
        .addTo(map)
        // Add popup
        .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
          autoClose: false,
          className: 'mapPopup',
        })
        .on('mouseover', function () {
          this.openPopup();
        })
        .on('mouseout', function () {
          this.closePopup();
        });
    });

    // connecting points via line
    L.polyline(points, {
      color: '#28b487', // Match tour theme
      weight: 2,
      opacity: 0.8,
      lineJoin: 'round',
    }).addTo(map);

    // Fly to bounds (animated)
    const bounds = L.latLngBounds(points).pad(0.5);
    map.flyToBounds(bounds, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25,
    });

    // Scroll disable
    map.scrollWheelZoom.disable();

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, [tour.locations]);

  useEffect(() => {
    if (tour.locations && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [tour.locations]);

  if (!tour) return <p>Loading..</p>;

  return (
    <main className="main">
      <section className="section-header">
        <div className="header__hero">
          <div className="header__hero-overlay">&nbsp;</div>
          <img
            className="header__hero-img"
            src={`/img/tours/${tour.imageCover}`}
            alt="Tour 5"
          />
        </div>
        <div className="heading-box">
          <h1 className="heading-primary">
            <span>{tour.name}</span>
          </h1>
          <div className="heading-box__group">
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use xlinkHref="/img/icons.svg#icon-clock"></use>
              </svg>
              <span className="heading-box__text">{`${tour.duration} days`}</span>
            </div>
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use xlinkHref="/img/icons.svg#icon-map-pin"></use>
              </svg>
              <span className="heading-box__text">
                {tour.startLocation?.description}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-description">
        <div className="overview-box">
          <div>
            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Quick facts</h2>
              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-calendar"></use>
                </svg>
                <span className="overview-box__label">Next date</span>
                <span className="overview-box__text">September 2025</span>
              </div>
              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-trending-up"></use>
                </svg>
                <span className="overview-box__label">Difficulty</span>
                <span className="overview-box__text">{tour.difficulty}</span>
              </div>
              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-user"></use>
                </svg>
                <span className="overview-box__label">Participants</span>
                <span className="overview-box__text">{`${tour.maxGroupSize} people`}</span>
              </div>
              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-star"></use>
                </svg>
                <span className="overview-box__label">Rating</span>
                <span className="overview-box__text">{`${tour.ratingsAverage?.toFixed(
                  2
                )}/5`}</span>
              </div>
            </div>

            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Your tour guides</h2>
              {tour.guides?.map((guide, index) => (
                <div className="overview-box__detail" key={index}>
                  <img
                    className="overview-box__img"
                    src={`/img/users/${guide.photo}`}
                  />
                  <span className="overview-box__label">{guide.role}</span>
                  <span className="overview-box__text">{guide.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="description-box">
          <h2 className="heading-secondary ma-bt-lg">{`About ${tour.name}`}</h2>
          <p className="description__text">{tour.description}</p>
        </div>
      </section>

      <section className="section-pictures">
        {[...Array(3)].map((_, i) => (
          <div className="picture-box" key={i}>
            <img
              className={`picture-box__img picture-box__img--${i + 1}`}
              src={`/img/tours/${tour.images?.[i]}`}
              alt={`Tour image ${i + 1}`}
            />
          </div>
        ))}
      </section>

      <section className="section-map">
        <div className="map">
          <div className="map__container" id="map" ref={mapRef}></div>
        </div>
      </section>

      <section className="section-reviews">
        <div className="reviews">
          {tour.reviews?.map((review, index) => (
            <div className="reviews__card" key={index}>
              <div className="reviews__avatar">
                <img
                  src={`/img/users/${review.user.photo}`}
                  alt={review.user.name}
                  className="reviews__avatar-img"
                />
                <h6 className="reviews__user">{review.user.name}</h6>
              </div>
              <p className="reviews__text">{review.review}</p>
              <div className="reviews__rating">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`reviews__star reviews__star--${
                      i < review.rating ? 'active' : 'inactive'
                    }`}
                  >
                    <use xlinkHref="/img/icons.svg#icon-star"></use>
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-cta">
        <div className="cta">
          <div className="cta__img cta__img--logo">
            <img src="/img/logo-white.png" alt="Natours logo" className="" />
          </div>
          {tour.images?.slice(0, 2).map((img, i) => (
            <img
              key={i}
              className={`cta__img cta__img--${i + 1}`}
              src={`/img/tours/${img}`}
              alt="Tour image"
            />
          ))}
          <div className="cta__content">
            <h2 className="heading-secondary">What are you waiting for?</h2>
            <p className="cta__text">
              {`${tour.duration} days. 1 adventure. Infinite memories. Make it yours today!`}
            </p>
            <Link
              to={`/tour/${tour.id}/book`}
              className="btn btn--green span-all-rows"
            >
              Book tour now!
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TourDetails;
