import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ShopDetailPage from "./pages/ShopDetailPage";

function App() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={<LandingPage />} />
                <Route path="shops/:shopName" element={<ShopDetailPage key={window.location.pathname} />} />
            </Route>
        </Routes>
    );
}

export default App;
