import React, { useState, useEffect } from "react";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import BitacoraHeader from "./components/sections/BitacoraHeader";
import LogGrid from "./components/sections/LogGrid";
import {
  getPaginatedEntries,
  BITACORA_CATEGORIES,
} from "../../data/bitacoraData";

const BitacoraPage = () => {
  const [activeCategory, setActiveCategory] = useState(BITACORA_CATEGORIES.ALL);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    entries: [],
    totalPages: 1,
    totalEntries: 0,
  });

  const ENTRIES_PER_PAGE = 9;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const category =
      activeCategory === BITACORA_CATEGORIES.ALL ? null : activeCategory;
    const data = getPaginatedEntries(currentPage, ENTRIES_PER_PAGE, category);
    setPaginationData(data);
  }, [activeCategory, currentPage]);

  const handleCategoryChange = (newCategory) => {
    setActiveCategory(newCategory);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleClearFilters = () => {
    setActiveCategory(BITACORA_CATEGORIES.ALL);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1B182B]">
      <NavbarComponent />

      <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <BitacoraHeader
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <LogGrid
          entries={paginationData.entries}
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          onPageChange={handlePageChange}
          onClearFilters={handleClearFilters}
          showEmptyAsNoResults={activeCategory !== BITACORA_CATEGORIES.ALL}
        />
      </main>

      <FooterComponent />
    </div>
  );
};

export default BitacoraPage;
