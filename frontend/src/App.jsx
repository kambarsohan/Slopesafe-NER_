import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import RiskMap from './pages/RiskMap'
import LocationDetails from './pages/LocationDetails'
import FieldReport from './pages/FieldReport'
import Admin from './pages/Admin'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<RiskMap />} />
        <Route path="/locations/:id" element={<LocationDetails />} />
        <Route path="/report" element={<FieldReport />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  )
}
