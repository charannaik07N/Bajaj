// // components/AutocompleteHeader.js
// import React, { useState, useEffect, useRef } from "react";
// import PropTypes from "prop-types";

// const AutocompleteHeader = ({
//   doctors,
//   searchTerm,
//   setSearchTerm,
//   onSearch,
// }) => {
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const suggestionRef = useRef(null);

//   // Handle search input change
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);

//     // Generate suggestions from doctors data
//     if (value.trim()) {
//       const matchedDoctors = doctors
//         .filter((doctor) =>
//           doctor.name.toLowerCase().includes(value.toLowerCase())
//         )
//         .slice(0, 3);
//       setSuggestions(matchedDoctors);
//       setShowSuggestions(true);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   };

//   // Handle suggestion click
//   const handleSuggestionClick = (doctorName) => {
//     setSearchTerm(doctorName);
//     setShowSuggestions(false);
//     onSearch(doctorName);
//   };

//   // Handle search submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSearch(searchTerm);
//     setShowSuggestions(false);
//   };

//   // Close suggestions when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         suggestionRef.current &&
//         !suggestionRef.current.contains(event.target)
//       ) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Handle keyboard navigation for suggestions
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       handleSubmit(e);
//     } else if (e.key === "Escape") {
//       setShowSuggestions(false);
//     }
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-3">
//       <div className="container">
//         <a className="navbar-brand" href="/">
//           <i className="bi bi-heart-pulse me-2"></i>
//           DocFinder
//         </a>

//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarSearch"
//           aria-controls="navbarSearch"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse" id="navbarSearch">
//           <div
//             className="ms-auto position-relative"
//             style={{ width: "100%", maxWidth: "600px" }}
//             ref={suggestionRef}
//           >
//             <form onSubmit={handleSubmit} className="w-100">
//               <div className="input-group">
//                 <input
//                   type="text"
//                   className="form-control py-2"
//                   placeholder="Search Doctors, Specialists, Clinics..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   onKeyDown={handleKeyDown}
//                   aria-label="Search"
//                   data-testid="autocomplete-input"
//                 />
//                 <button
//                   className="btn btn-light"
//                   type="submit"
//                   aria-label="Search"
//                 >
//                   <i className="bi bi-search"></i>
//                 </button>
//               </div>
//             </form>

//             {showSuggestions && suggestions.length > 0 && (
//               <div
//                 className="position-absolute w-100 shadow-lg rounded-bottom bg-white z-index-dropdown"
//                 style={{ zIndex: 1000 }}
//               >
//                 {suggestions.map((doctor, index) => (
//                   <div
//                     key={index}
//                     className="suggestion-item p-3 border-bottom cursor-pointer hover-bg-light"
//                     onClick={() => handleSuggestionClick(doctor.name)}
//                     data-testid="suggestion-item"
//                     style={{ cursor: "pointer" }}
//                   >
//                     <div className="d-flex align-items-center">
//                       <div className="suggestion-img me-3">
//                         <img
//                           src={doctor.photo || "/api/placeholder/40/40"}
//                           alt={doctor.name}
//                           className="rounded-circle"
//                           width="40"
//                           height="40"
//                         />
//                       </div>
//                       <div>
//                         <div className="fw-bold">{doctor.name}</div>
//                         <div className="text-muted small">
//                           {doctor.specialties &&
//                             (Array.isArray(doctor.specialties)
//                               ? doctor.specialties[0]?.name ||
//                                 doctor.specialties[0]
//                               : doctor.specialties?.name || "")}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// AutocompleteHeader.propTypes = {
//   doctors: PropTypes.array.isRequired,
//   searchTerm: PropTypes.string.isRequired,
//   setSearchTerm: PropTypes.func.isRequired,
//   onSearch: PropTypes.func.isRequired,
// };

// export default AutocompleteHeader;
