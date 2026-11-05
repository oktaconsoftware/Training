import { jsx as _jsx } from "react/jsx-runtime";
import "./globals.css";
export const metadata = {
    title: "User Management CRUD",
    description: "Simple user management application built with Next.js, Drizzle ORM and PostgreSQL.",
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", children: _jsx("body", { children: children }) }));
}
