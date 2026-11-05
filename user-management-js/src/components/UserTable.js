"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pencil, Trash2, Users } from "lucide-react";
function initials(name) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}
export default function UserTable({ users, loading, onEdit, onDelete }) {
    if (loading) {
        return (_jsx("div", { className: "space-y-3 p-6", children: [1, 2, 3, 4].map((item) => (_jsx("div", { className: "h-14 animate-pulse rounded-lg bg-slate-100" }, item))) }));
    }
    if (users.length === 0) {
        return (_jsxs("div", { className: "flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center", children: [_jsx("div", { className: "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500", children: _jsx(Users, { size: 23 }) }), _jsx("h3", { className: "font-semibold text-slate-900", children: "No users found" }), _jsx("p", { className: "mt-1 max-w-sm text-sm text-slate-500", children: "Add your first user or try another search term." })] }));
    }
    return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[720px] text-left text-sm", children: [_jsx("thead", { className: "bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 font-semibold", children: "User" }), _jsx("th", { className: "px-6 py-4 font-semibold", children: "Phone" }), _jsx("th", { className: "px-6 py-4 font-semibold", children: "Age" }), _jsx("th", { className: "px-6 py-4 font-semibold", children: "Date added" }), _jsx("th", { className: "px-6 py-4 text-right font-semibold", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: users.map((user) => (_jsxs("tr", { className: "transition hover:bg-slate-50/70", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700", children: initials(user.name) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate font-medium text-slate-900", children: user.name }), _jsx("p", { className: "mt-0.5 truncate text-slate-500", children: user.email })] })] }) }), _jsx("td", { className: "px-6 py-4 text-slate-600", children: user.phone || "—" }), _jsx("td", { className: "px-6 py-4 text-slate-600", children: user.age ?? "—" }), _jsx("td", { className: "px-6 py-4 text-slate-600", children: new Date(user.createdAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => onEdit(user), "aria-label": `Edit ${user.name}`, title: "Edit user", className: "rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700", children: _jsx(Pencil, { size: 16 }) }), _jsx("button", { type: "button", onClick: () => onDelete(user), "aria-label": `Delete ${user.name}`, title: "Delete user", className: "rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700", children: _jsx(Trash2, { size: 16 }) })] }) })] }, user.id))) })] }) }));
}
