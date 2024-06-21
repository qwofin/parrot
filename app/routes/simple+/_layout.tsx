import { Navbar, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import type { LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, useMatches } from "@remix-run/react";
import { Link } from "react-router-dom";
import { SearchInput } from "~/components/SearchInput";
import stylesheet from "~/tailwind.css";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  const matches = useMatches();
  const match = matches.find(
    (match) => match.handle && (match.handle as { title?: string }).title
  );
  let title = "Parrot"
  if (match) {
    title = (match.handle as { title: string }).title as string;
  }
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Navbar isBordered className="border-black">
          <NavbarContent justify="start">
            <NavbarItem className="font-bold">{title}</NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem className="font-bold"> <SearchInput action="/simple/books" /></NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem className="h-full border-black border-x-1">
              <Link
                to="/simple"
                className="px-5 h-full items-center justify-center flex"
              >
                Menu
              </Link>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
        <main className="container mx-auto pt-4 px-4">
          <Outlet />
        </main>
        <LiveReload />
      </body>
    </html>
  );
}
