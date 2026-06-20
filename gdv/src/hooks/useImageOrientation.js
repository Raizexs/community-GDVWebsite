import { useCallback, useEffect, useState } from "react";

export function useImageOrientation(resetKey) {
  const [orientation, setOrientation] = useState(null);

  useEffect(() => {
    setOrientation(null);
  }, [resetKey]);

  const onImageLoad = useCallback((event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setOrientation(
        naturalWidth / naturalHeight >= 1.05 ? "landscape" : "portrait",
      );
    }
  }, []);

  return { orientation, onImageLoad };
}
