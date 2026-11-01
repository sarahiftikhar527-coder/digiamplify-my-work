import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black">
      <h1 className="text-7xl font-bold text-primary-light">404</h1>
      <p className="text-gray-300">Page not found</p>
      <Link
        to="/dashboard"
        className="rounded-lg bg-primary px-6 py-2 font-medium hover:bg-primary-light"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;