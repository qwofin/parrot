import { Link } from "@remix-run/react";

type SimplePaginationProps = {
  total: number;
  page: number;
  pathname: string;
  searchParams?: { [key: string]: string };
};

export function SimplePagination(props: SimplePaginationProps) {
  function SimplePaginationButton(
    page: number,
    text?: string
  ) {
    const pageSearchParams = new URLSearchParams(props.searchParams);
    pageSearchParams.set("page", page.toString());
    const url = `${props.pathname}?${pageSearchParams.toString()}`;
    return (
      <Link to={url} className="py-5 px-7 border-1 border-black inline-block">
        {text ?? page}
      </Link>
    );
  }
  const buttons = [];
  const leftControls = []
  const rightControls = []
  if (props.page > 1) {
    leftControls.push(SimplePaginationButton(1, "<<"));
    leftControls.push(
      SimplePaginationButton(props.page - 1, "<")
    );
  }
  if (props.page < props.total) {
    rightControls.push(
      SimplePaginationButton(props.page + 1, ">")
    );
    rightControls.push(SimplePaginationButton(props.total, ">>"));
  }
  const startPage = Math.max(1, props.page - 2);
  const endPage = Math.min(props.total, props.page + 2);
  for (let p = startPage; p <= endPage; p += 1) {
    buttons.push(SimplePaginationButton(p));
  }



  return <div className="flex justify-between">
    <div>{leftControls}</div>
    <div className="object-center">{buttons}</div>
    <div className="object-right">{rightControls}</div>
    </div>
}
