import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DoctorListing from "./compounds/DoctorListing";
// import AutocompleteHeader from "./compounds/AutocompleteHeader";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <>

    {/* <AutocompleteHeader/> */}
    <Router>
      <Routes>
        <Route path="/" element={<DoctorListing />} />
      </Routes>
    </Router>

    </>
  );
}

export default App;
