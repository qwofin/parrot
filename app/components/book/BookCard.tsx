import type { bookSchema } from "~/db/schema";
import { Card, CardFooter, Image } from "@nextui-org/react";
import { Link } from "@remix-run/react";

export type Props = {
  book: typeof bookSchema.$inferSelect;
};

export function BookCard(props: Props) {
  let cover = null;
  let cardClass = "flex-col absolute h-full dark:bg-black/50 bg-white/50 z-10";
  if (props.book.cover) {
    cardClass += " invisible group-hover:visible group-focus:visible transition ease-in-out";
    cover = (
      <Image
        src={props.book.cover}
        alt="book cover"
        removeWrapper
        radius="none"
        className="object-fill z-0"
      />
    );
  }

  function renderSeries(series: string | null) {
    if (!series) return "";
    const split = series.split(";").map((item) => item.trim());

    return (
      <small className="mt-5 dark:text-default-600">
        {split.map((item) => (
          <div key={item}>
            {item}
            <br />
          </div>
        ))}
      </small>
    );
  }

  return (
    <Link to={`/book/${props.book.id}`}>
      <Card
        isPressable
        isFooterBlurred
        radius="none"
        className="group h-full w-full"
      >
        {cover}
        <CardFooter className={cardClass}>
          <h3>{props.book.authorName}</h3>
          <h4 className="font-bold text-large">{props.book.title}</h4>
          {renderSeries(props.book.seriesTitle)}
        </CardFooter>
      </Card>
    </Link>
  );
}
