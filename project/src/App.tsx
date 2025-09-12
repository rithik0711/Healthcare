// import React from 'react';
import { useState, useEffect } from 'react';
import { Heart, LogOut } from 'lucide-react';
import { LoginForm } from './components/Auth/LoginForm';
import { DoctorRegistration } from './components/Auth/DoctorRegistration';
import { DoctorDashboard } from './components/Doctor/DoctorDashboard';
import { PatientDashboard } from './components/Patient/PatientDashboard';
import { User, Doctor, Patient } from './types';
import { api } from './services/api';

type AppState = 'login' | 'doctor-registration' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('telemedicine_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setAppState('dashboard');
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('telemedicine_user');
      }
    }
  }, []);

  const handleLogin = async (email: string, password: string, role: 'doctor' | 'patient') => {
    setLoading(true);
    try {
      const user = await api.login(email, password, role);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('telemedicine_user', JSON.stringify(user));
        setAppState('dashboard');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorRegistration = async (doctorData: Partial<Doctor>) => {
    setLoading(true);
    try {
      const doctor = await api.registerDoctor(doctorData);
      setCurrentUser(doctor);
      localStorage.setItem('telemedicine_user', JSON.stringify(doctor));
      setAppState('dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('telemedicine_user');
    setAppState('login');
  };

  // Render based on current state
  if (appState === 'login') {
    return (
      <LoginForm
        onLogin={handleLogin}
        onRegisterDoctor={() => setAppState('doctor-registration')}
        loading={loading}
      />
    );
  }

  if (appState === 'doctor-registration') {
    return (
      <DoctorRegistration
        onRegister={handleDoctorRegistration}
        onBack={() => setAppState('login')}
        loading={loading}
      />
    );
  }

  if (appState === 'dashboard' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Global Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center gap-5">
                <img src="./images/profile.png" alt="" className='w-10 h-10 rounded-lg'/>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">TeleMedicine</h1>
                    <p className="text-xs text-gray-500">Healthcare Platform</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div>
          {currentUser.role === 'doctor' ? (
            <DoctorDashboard doctor={currentUser as Doctor} />
          ) : (
            <PatientDashboard patient={currentUser as Patient} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading TeleMed Pro...</p>
      </div>
    </div>
  );
}

export default App;