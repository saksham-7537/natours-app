import { Link, useRouteError } from "react-router-dom";

const Error = () => {
  const error = useRouteError();
  const status = error?.status || 500;
  const message =
    error?.data?.message || error?.message || "Please try again later.";

  return (
    <main className="main">
      <div className="error">
        <div className="error__title">
          <h2 className="heading-secondary heading-secondary--error">
            Something went wrong!
          </h2>
          <h3 className="error__status">Error {status}</h3>
        </div>
        <p className="error__msg">{message}</p>
        <Link to="/" className="btn btn--green">
          Back to home
        </Link>
      </div>
    </main>
  );
};

export default Error;
