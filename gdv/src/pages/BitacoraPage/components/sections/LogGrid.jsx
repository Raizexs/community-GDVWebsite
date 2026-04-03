import React from "react";
import LogCard from "./LogCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";

const LogGrid = ({
  entries = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onClearFilters,
  showEmptyAsNoResults = false,
}) => {
  if (entries.length === 0) {
    return (
      <EmptyState
        variant={showEmptyAsNoResults ? "no-results" : "empty"}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div>
      <div
        className="
          grid 
          grid-cols-1 
          md:grid-cols-2 
          lg:grid-cols-3 
          gap-6 
          md:gap-8
        "
      >
        {entries.map((entry) => (
          <LogCard key={entry.id} entry={entry} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          showNumbers={true}
        />
      )}
    </div>
  );
};

export default LogGrid;
