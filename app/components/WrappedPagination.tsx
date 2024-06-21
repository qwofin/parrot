import { Pagination } from "@nextui-org/pagination";
import type {
  PaginationProps,
} from "@nextui-org/pagination";
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";

export function WrappedPagination(props: PaginationProps) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();

  function setPage(page: number) {
    const pageSearchParams = new URLSearchParams(searchParams.toString());
    pageSearchParams.set("page", page.toString());
    const url = `${pathname}?${pageSearchParams.toString()}`
    navigate(url);
  }
  if (props.total < 2) return null;
  return <Pagination {...props} onChange={setPage}/>;
}
