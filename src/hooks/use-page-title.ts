import { useEffect } from "react";

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | Classroom AI`;
  }, [title]);
};

export default usePageTitle;
