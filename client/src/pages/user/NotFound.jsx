import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-page py-16 text-center">
      <h1 className="text-3xl font-black">Page not found</h1>
      <Link to="/" className="btn-primary mt-5">Go home</Link>
    </div>
  );
}
