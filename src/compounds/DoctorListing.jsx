import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DoctorListing.css";

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    consultationType: "",
    specialties: [],
    sortBy: "",
  });
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }
        const data = await response.json();

        const transformedData = data.map((doctor) => {
          const experienceMatch = doctor.experience
            ? doctor.experience.match(/\d+/)
            : null;
          const experienceYears = experienceMatch
            ? parseInt(experienceMatch[0])
            : 0;

          const feesMatch = doctor.fees ? doctor.fees.match(/\d+/) : null;
          const feesAmount = feesMatch ? parseInt(feesMatch[0]) : 0;

          return {
            id: doctor.id,
            name: doctor.name || "",
            photo: doctor.photo || null,
            specialties: doctor.specialities
              ? doctor.specialities.map((spec) => spec.name)
              : [],
            fees: feesAmount,
            experience: experienceYears,
            qualifications: doctor.qualifications || "",
            clinic: doctor.clinic?.name || "",
            location: doctor.clinic?.address?.city || "",
            videoConsult: doctor.video_consult || false,
            inClinic: doctor.in_clinic || false,
          };
        });

        setDoctors(transformedData);
        setFilteredDoctors(transformedData);

        const allSpecialties = new Set();
        transformedData.forEach((doctor) => {
          if (doctor.specialties && Array.isArray(doctor.specialties)) {
            doctor.specialties.forEach((specialty) =>
              allSpecialties.add(specialty)
            );
          }
        });
        setSpecialties(Array.from(allSpecialties).sort());

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const queryFilters = {
      consultationType: queryParams.get("consultationType") || "",
      specialties: queryParams.getAll("specialty") || [],
      sortBy: queryParams.get("sortBy") || "",
    };

    setFilters(queryFilters);
    setSearchTerm(queryParams.get("search") || "");
  }, [location.search]);

  useEffect(() => {
    if (doctors.length === 0) return;

    const queryParams = new URLSearchParams();

    if (searchTerm) queryParams.set("search", searchTerm);
    if (filters.consultationType)
      queryParams.set("consultationType", filters.consultationType);
    if (filters.sortBy) queryParams.set("sortBy", filters.sortBy);

    filters.specialties.forEach((specialty) => {
      queryParams.append("specialty", specialty);
    });

    navigate(`?${queryParams.toString()}`, { replace: true });

    applyFilters();
  }, [filters, searchTerm, doctors, navigate]);

  const applyFilters = () => {
    let results = [...doctors];

    if (searchTerm) {
      results = results.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.consultationType) {
      results = results.filter((doctor) => {
        if (filters.consultationType === "video") {
          return doctor.videoConsult;
        } else if (filters.consultationType === "clinic") {
          return doctor.inClinic;
        }
        return true;
      });
    }

    if (filters.specialties.length > 0) {
      results = results.filter(
        (doctor) =>
          doctor.specialties &&
          filters.specialties.some((specialty) =>
            doctor.specialties.includes(specialty)
          )
      );
    }

    if (filters.sortBy === "fees") {
      results.sort((a, b) => a.fees - b.fees);
    } else if (filters.sortBy === "experience") {
      results.sort((a, b) => b.experience - a.experience);
    }

    setFilteredDoctors(results);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const matchedDoctors = doctors
        .filter((doctor) =>
          doctor.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 3);
      setSuggestions(matchedDoctors);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (doctorName) => {
    setSearchTerm(doctorName);
    setSuggestions([]);
  };

  const handleConsultationTypeChange = (type) => {
    setFilters({
      ...filters,
      consultationType: type,
    });
  };

  const handleSpecialtyChange = (specialty, isChecked) => {
    let updatedSpecialties = [...filters.specialties];

    if (isChecked) {
      updatedSpecialties.push(specialty);
    } else {
      updatedSpecialties = updatedSpecialties.filter((s) => s !== specialty);
    }

    setFilters({
      ...filters,
      specialties: updatedSpecialties,
    });
  };

  const handleSortChange = (sortOption) => {
    setFilters({
      ...filters,
      sortBy: sortOption,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      consultationType: "",
      specialties: [],
      sortBy: "",
    });
    setSearchTerm("");
    setSuggestions([]);
  };

  // Toggle filters on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const renderText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return value;
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-0 py-3 bg-primary shadow">
        <div className="col-12 col-md-10 col-lg-8 mx-auto px-3">
          <div className="position-relative">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search Symptoms, Doctors, Specialists, Clinics"
                value={searchTerm}
                onChange={handleSearchChange}
                data-testid="autocomplete-input"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="suggestions-dropdown shadow-lg">
                {suggestions.map((doctor, index) => (
                  <div
                    key={index}
                    className="suggestion-item p-3 border-bottom"
                    onClick={() => handleSuggestionClick(doctor.name)}
                    data-testid="suggestion-item"
                  >
                    <div className="d-flex align-items-center">
                      {doctor.photo && (
                        <div className="suggestion-img me-3">
                          <img
                            src={doctor.photo}
                            alt="Doctor"
                            className="rounded-circle"
                            width="40"
                            height="40"
                            onError={(e) => {
                              e.target.src = "/api/placeholder/40/40";
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <div className="fw-bold">{renderText(doctor.name)}</div>
                        <div className="text-muted small">
                          {doctor.specialties && doctor.specialties.length > 0
                            ? doctor.specialties[0]
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row">
          <div className="col-12 d-md-none mb-3">
            <button
              className="btn btn-outline-primary w-100 d-flex justify-content-between align-items-center"
              onClick={toggleFilters}
            >
              <span>
                <i className="bi bi-funnel me-2"></i>
                Filters
              </span>
              <i className={`bi bi-chevron-${showFilters ? "up" : "down"}`}></i>
            </button>
          </div>

          <div
            className={`col-md-4 col-lg-3 ${
              showFilters || window.innerWidth >= 768 ? "d-block" : "d-none"
            }`}
          >
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="m-0 fw-bold text-primary">Filters</h5>
                  <button
                    className="btn btn-sm btn-link text-primary text-decoration-none p-0"
                    onClick={handleClearFilters}
                  >
                    Clear All
                  </button>
                </div>

                <div className="filter-section mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6
                      className="m-0 fw-bold"
                      data-testid="filter-header-speciality"
                    >
                      Specialities
                    </h6>
                    <i className="bi bi-chevron-up"></i>
                  </div>
                  <div
                    className="specialities-list"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {specialties.map((specialty, index) => (
                      <div className="form-check mb-2" key={index}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`specialty-${specialty
                            .replace(/\s+/g, "-")
                            .replace(/\//g, "-")}`}
                          checked={filters.specialties.includes(specialty)}
                          onChange={(e) =>
                            handleSpecialtyChange(specialty, e.target.checked)
                          }
                          data-testid={`filter-specialty-${specialty
                            .replace(/\s+/g, "-")
                            .replace(/\//g, "-")}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`specialty-${specialty
                            .replace(/\s+/g, "-")
                            .replace(/\//g, "-")}`}
                        >
                          {specialty}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="filter-section mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="m-0 fw-bold" data-testid="filter-header-moc">
                      Mode of Consultation
                    </h6>
                    <i className="bi bi-chevron-up"></i>
                  </div>
                  <div className="consultation-modes">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="consultationType"
                        id="videoConsult"
                        checked={filters.consultationType === "video"}
                        onChange={() => handleConsultationTypeChange("video")}
                        data-testid="filter-video-consult"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="videoConsult"
                      >
                        <i className="bi bi-camera-video me-2 text-primary"></i>
                        Video Consult
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="consultationType"
                        id="inClinic"
                        checked={filters.consultationType === "clinic"}
                        onChange={() => handleConsultationTypeChange("clinic")}
                        data-testid="filter-in-clinic"
                      />
                      <label className="form-check-label" htmlFor="inClinic">
                        <i className="bi bi-building me-2 text-primary"></i>
                        In Clinic
                      </label>
                    </div>
                    {filters.consultationType && (
                      <div className="text-end mt-2">
                        <button
                          className="btn btn-sm btn-link text-primary p-0"
                          onClick={() => handleConsultationTypeChange("")}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="filter-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6
                      className="m-0 fw-bold"
                      data-testid="filter-header-sort"
                    >
                      Sort by
                    </h6>
                    <i className="bi bi-chevron-up"></i>
                  </div>
                  <div className="sort-options">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sortBy"
                        id="sortByFees"
                        checked={filters.sortBy === "fees"}
                        onChange={() => handleSortChange("fees")}
                        data-testid="sort-fees"
                      />
                      <label className="form-check-label" htmlFor="sortByFees">
                        <i className="bi bi-currency-rupee me-2 text-primary"></i>
                        Fees: Low-High
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sortBy"
                        id="sortByExperience"
                        checked={filters.sortBy === "experience"}
                        onChange={() => handleSortChange("experience")}
                        data-testid="sort-experience"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="sortByExperience"
                      >
                        <i className="bi bi-briefcase me-2 text-primary"></i>
                        Experience: Most first
                      </label>
                    </div>
                    {filters.sortBy && (
                      <div className="text-end mt-2">
                        <button
                          className="btn btn-sm btn-link text-primary p-0"
                          onClick={() => handleSortChange("")}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-8 col-lg-9">
            {/* Active filters */}
            {(filters.specialties.length > 0 ||
              filters.consultationType ||
              filters.sortBy ||
              searchTerm) && (
              <div className="active-filters mb-3">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="text-muted">Active filters:</span>

                  {searchTerm && (
                    <span className="badge bg-light text-dark p-2 d-flex align-items-center">
                      <span className="me-2">Search: {searchTerm}</span>
                      <button
                        className="btn btn-sm p-0 border-0"
                        onClick={() => setSearchTerm("")}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </span>
                  )}

                  {filters.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="badge bg-light text-dark p-2 d-flex align-items-center"
                    >
                      <span className="me-2">{specialty}</span>
                      <button
                        className="btn btn-sm p-0 border-0"
                        onClick={() => handleSpecialtyChange(specialty, false)}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </span>
                  ))}

                  {filters.consultationType && (
                    <span className="badge bg-light text-dark p-2 d-flex align-items-center">
                      <span className="me-2">
                        {filters.consultationType === "video"
                          ? "Video Consult"
                          : "In Clinic"}
                      </span>
                      <button
                        className="btn btn-sm p-0 border-0"
                        onClick={() => handleConsultationTypeChange("")}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </span>
                  )}

                  {filters.sortBy && (
                    <span className="badge bg-light text-dark p-2 d-flex align-items-center">
                      <span className="me-2">
                        Sort:{" "}
                        {filters.sortBy === "fees"
                          ? "Fees Low-High"
                          : "Experience"}
                      </span>
                      <button
                        className="btn btn-sm p-0 border-0"
                        onClick={() => handleSortChange("")}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="mb-3">
                <p className="text-muted mb-0">
                  Found {filteredDoctors.length} doctors
                </p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading doctors...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-5 card shadow-sm">
                <div className="card-body">
                  <i className="bi bi-search display-1 text-muted"></i>
                  <h4 className="mt-3">No doctors found</h4>
                  <p className="text-muted">
                    Try adjusting your filters or search term
                  </p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={handleClearFilters}
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            ) : (
              filteredDoctors.map((doctor, index) => (
                <div
                  key={index}
                  className="card mb-3 shadow-sm hover-shadow transition-all"
                  data-testid="doctor-card"
                >
                  <div className="card-body">
                    <div className="row g-3">
                      {/* Doctor info */}
                      <div className="col-lg-8">
                        <div className="d-flex flex-column flex-sm-row">
                          <div className="doctor-img me-sm-3 mb-3 mb-sm-0 text-center">
                            <img
                              src={doctor.photo || "/api/placeholder/100/100"}
                              alt="Doctor"
                              className="rounded-circle shadow-sm"
                              width="100"
                              height="100"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/100/100";
                              }}
                            />
                          </div>
                          <div>
                            <h5
                              className="mb-1 text-primary"
                              data-testid="doctor-name"
                            >
                              {renderText(doctor.name)}
                            </h5>
                            <p
                              className="mb-2 text-muted"
                              data-testid="doctor-specialty"
                            >
                              {doctor.specialties &&
                              Array.isArray(doctor.specialties)
                                ? doctor.specialties.join(", ")
                                : ""}
                            </p>
                            <div className="d-flex flex-wrap gap-3 mb-2">
                              <div
                                className="d-flex align-items-center"
                                data-testid="doctor-experience"
                              >
                                <i className="bi bi-briefcase text-primary me-2"></i>
                                <span>
                                  {doctor.experience} years experience
                                </span>
                              </div>
                              {doctor.fees && (
                                <div
                                  className="d-flex align-items-center"
                                  data-testid="doctor-fee"
                                >
                                  <i className="bi bi-currency-rupee text-primary me-2"></i>
                                  <span>₹{doctor.fees} consultation fee</span>
                                </div>
                              )}
                            </div>
                            <p className="mb-2 small text-secondary">
                              {typeof doctor.qualifications === "string"
                                ? doctor.qualifications
                                : Array.isArray(doctor.qualifications)
                                ? doctor.qualifications.join(", ")
                                : ""}
                            </p>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {doctor.videoConsult && (
                                <span className="badge bg-light text-primary border border-primary-subtle">
                                  <i className="bi bi-camera-video me-1"></i>
                                  Video Consult
                                </span>
                              )}
                              {doctor.inClinic && (
                                <span className="badge bg-light text-primary border border-primary-subtle">
                                  <i className="bi bi-building me-1"></i>
                                  In-Clinic
                                </span>
                              )}
                              {doctor.clinic && (
                                <span className="badge bg-light text-dark">
                                  {doctor.clinic}
                                </span>
                              )}
                              {doctor.location && (
                                <span className="badge bg-light text-dark">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {doctor.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking section */}
                      <div className="col-lg-4">
                        <div className="booking-section h-100 d-flex flex-column justify-content-center align-items-center align-items-lg-end">
                          <h5
                            className="text-success mb-3 fw-bold"
                            data-testid="doctor-fee"
                          >
                            ₹ {doctor.fees}
                          </h5>
                          <button className="btn btn-primary w-100 w-sm-auto">
                            <i className="bi bi-calendar-check me-2"></i>
                            Book Appointment
                          </button>
                          <button className="btn btn-link text-primary mt-2">
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorListing;
