import AppRoutes from '@/routes/IndexRoute';
import { Toaster } from 'react-hot-toast';
import './index.css';
import ScrollToTop from './components/common/home/ScroolToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
