import { useEffect } from "react";

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | Tablawy OS`;
  }, [title]);
};

export default usePageTitle;
