import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import { Tent } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // As per backend logic, we could use our own API but since we have 
        // Supabase directly in frontend we can just use it to sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) throw error;
        
        // Let backend trigger handle the profile insert or we do it here
        if (data.user) {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            email,
            full_name: fullName
          }]);
        }
        
        // After signup, might need to login or redirect
        if (!error) navigate('/');

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center" style={{ minHeight: '80vh' }}>
      {/* UFO Animations */}
      <div className="ufo-container">
        <div className="ufo">🛸</div>
        <div className="alien">👽</div>
      </div>

      <div className="mb-8 text-center" style={{ zIndex: 1 }}>
        <div className="flex justify-center mb-4 text-secondary">
          <Tent size={56} />
        </div>
        <h1 className="text-3xl text-primary">Expedición Uritorco</h1>
        <p className="text-muted mt-2">Finanzas místicas de nuestro viaje</p>
      </div>

      <div className="card w-full">
        <h2 className="mb-4 text-center">{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-danger rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          {isSignUp && (
            <div className="input-group">
              <label>Nombre completo</label>
              <input
                type="text"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            className="text-primary font-medium border-none bg-transparent cursor-pointer"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? '¿Ya tenés cuenta? Ingresá' : '¿No tenés cuenta? Registrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
