import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SearchInput } from "./SearchInput";
import { useLocation } from "@remix-run/react";
export function PageNavbar() {
  const pathname = useLocation().pathname;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menu = [
    ["Books", "/books"],
    ["Settings", "/readarr"],
  ];

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
      <NavbarBrand >
        <Link className="font-bold text-inherit" href="/">Parrot</Link>
      </NavbarBrand>
        <SearchInput />
        <ThemeSwitcher />
      </NavbarContent>
      <NavbarContent className="hidden sm:flex" justify="center">
        {menu.map((item) => (
          <NavbarItem key={item[0]} isActive={pathname === item[1]}>
            <Link href={item[1]}>{item[0]}</Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarMenu>
        {menu.map((item) => (
          <NavbarMenuItem key={item[0]}>
            <Link
              className="w-full"
              href={item[1]}
              size="lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {item[0]}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
    </Navbar>
  );
}
