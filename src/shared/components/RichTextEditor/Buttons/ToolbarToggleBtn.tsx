// Used in the toolbar to determine how many items to show and how many pages.
// If the screen is too small, buttons will appear on the sides to go to the next
// and previous pages of toolbar buttons.

import { Button } from "@/shared/components/ui/button";
import { FcNext, FcPrevious } from "react-icons/fc";

interface IToolbarToggleBtnProps {
  page: number;
  setPage: (pageNum: number) => void;
  maxPages: number;
  isSmall?: boolean;
}

export const ToolbarToggleBtn = ({
  page,
  setPage,
  maxPages,
  isSmall,
}: IToolbarToggleBtnProps) => {
  const minPages = 1;

  const goNextPage = () => {
    setPage(page + 1);
  };

  const goPrevPage = () => {
    setPage(page - 1);
  };

  return (
    <div className="flex">
      {isSmall ? (
        <>
          {page <= maxPages && page !== 1 ? (
            <Button variant="ghost" className="mx-1" onClick={goPrevPage}>
              <FcPrevious />
            </Button>
          ) : null}

          {page !== maxPages ? (
            <Button variant="ghost" className="mx-1" onClick={goNextPage}>
              <FcNext />
            </Button>
          ) : null}
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            className="mx-1"
            onClick={goPrevPage}
            disabled={page === minPages}
          >
            <FcPrevious />
          </Button>
          <Button
            variant="ghost"
            className="mx-1"
            onClick={goNextPage}
            disabled={page === maxPages}
          >
            <FcNext />
          </Button>
        </>
      )}
    </div>
  );
};
