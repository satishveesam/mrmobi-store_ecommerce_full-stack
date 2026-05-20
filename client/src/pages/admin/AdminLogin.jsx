import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { loginAdmin } from '../../redux/slices/authSlice.js';

export default function AdminLogin() {
  const [values, setValues] = useState({ username: '', password: '' });
  const { token, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (token) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginAdmin({
      username: values.username.trim(),
      password: values.password.trim(),
    }));
    if (loginAdmin.fulfilled.match(result)) navigate('/admin/dashboard');
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gray-100 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-md bg-green-50 text-green-700">
          <Lock />
        </div>
        <h1 className="text-2xl font-black">Admin Login</h1>
        <p className="mb-5 mt-1 text-sm text-gray-600">Use your Spring Boot admin credentials.</p>
        <div className="grid gap-4">
          <input className="form-input" placeholder="Username" value={values.username} onChange={(e) => setValues({ ...values, username: e.target.value })} required />
          <input className="form-input" placeholder="Password" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} required />
          <button className="btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </div>
      </form>
    </div>
  );
}
