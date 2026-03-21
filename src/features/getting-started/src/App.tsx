import './index.css';
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import OverView from './Components/OverView';

function GettingStarted() {
  return (
    <Routes>
      <Route index element={<OverView />} />
      <Route path="overview" element={<OverView />} />
      <Route path="*" element={<Navigate to="/getting-started" replace />} />
    </Routes>
  );
}

export default GettingStarted;