import { Routes, Route } from 'react-router-dom';

import Home from './Home.jsx';
import Relato from './Relato.jsx';
import Mapa from './Mapa.jsx';
import Admin from './Admin.jsx';
import NotFound from './NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/relato" element={<Relato />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}