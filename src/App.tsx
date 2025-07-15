import AppRoutes from '@/routes/IndexRoute';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
