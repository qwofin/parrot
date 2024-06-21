import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { NextUIProvider } from "@nextui-org/react";
import stylesheet from "~/tailwind.css";
import { ThemeProvider } from "next-themes";
import { PageNavbar } from "~/components/PageNavbar";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class">
          <NextUIProvider>
            <PageNavbar />
            <div className="relative flex flex-col h-screen">
              <main className="container mx-auto max-w-screen-2xl pt-16 px-6 flex-grow">
                <Outlet />
              </main>
            </div>
          </NextUIProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
