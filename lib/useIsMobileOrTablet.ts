import { useEffect, useState } from "react";

// Returns true for screens < 1024px (mobile and tablet)
export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    function checkWidth() {
      setIsMobileOrTablet(window.innerWidth < 1024);
    }
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return isMobileOrTablet;
}
