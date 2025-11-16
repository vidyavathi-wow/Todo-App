import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import AppContext from './context/AppContext';
import Loader from './components/common/Loader';
import AppRoutes from './routes/AppRoutes';

function App() {
  const { loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <AppRoutes />
    </>
  );
}

export default App;
