"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, Search, Users, UserRoundPlus, RefreshCw, X, } from "lucide-react";
import UserForm from "@/components/UserForm";
import UserTable from "@/components/UserTable";
export default function HomePage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [notice, setNotice] = useState(null);
    const [pageError, setPageError] = useState("");
    const fetchUsers = useCallback(async (searchTerm = "") => {
        setLoading(true);
        setPageError("");
        try {
            const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
            const response = await fetch(`/api/users${query}`, { cache: "no-store" });
            const result = (await response.json());
            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || "Unable to load users");
            }
            setUsers(result.data);
        }
        catch (error) {
            setPageError(error instanceof Error ? error.message : "Unable to load users");
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchUsers(search.trim());
        }, search ? 300 : 0);
        return () => window.clearTimeout(timer);
    }, [search, fetchUsers]);
    useEffect(() => {
        if (!notice)
            return;
        const timer = window.setTimeout(() => setNotice(null), 3500);
        return () => window.clearTimeout(timer);
    }, [notice]);
    const totalUsers = users.length;
    const latestUser = useMemo(() => {
        if (users.length === 0)
            return null;
        return [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    }, [users]);
    function openAddForm() {
        setSelectedUser(null);
        setFormOpen(true);
    }
    function openEditForm(user) {
        setSelectedUser(user);
        setFormOpen(true);
    }
    async function saveUser(values) {
        setSaving(true);
        try {
            const isEditing = Boolean(selectedUser);
            const url = isEditing ? `/api/users/${selectedUser.id}` : "/api/users";
            const method = isEditing ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    phone: values.phone || null,
                    age: values.age === "" ? null : Number(values.age),
                }),
            });
            const result = (await response.json());
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to save user");
            }
            setFormOpen(false);
            setSelectedUser(null);
            setNotice({
                type: "success",
                text: isEditing ? "User updated successfully." : "User added successfully.",
            });
            await fetchUsers(search.trim());
        }
        finally {
            setSaving(false);
        }
    }
    async function deleteUser(user) {
        const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`);
        if (!confirmed)
            return;
        try {
            const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
            const result = (await response.json());
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to delete user");
            }
            setNotice({ type: "success", text: "User deleted successfully." });
            await fetchUsers(search.trim());
        }
        catch (error) {
            setNotice({
                type: "error",
                text: error instanceof Error ? error.message : "Unable to delete user",
            });
        }
    }
    return (_jsxs("main", { className: "min-h-screen bg-[#f6f8fc]", children: [_jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: [_jsxs("header", { className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-blue-600" }), "SIMPLE CRUD APPLICATION"] }), _jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl", children: "User Management" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Add, view, edit and manage your users in one place." })] }), _jsxs("button", { type: "button", onClick: openAddForm, className: "btn-primary self-start sm:self-auto", children: [_jsx(Plus, { size: 18 }), "Add user"] })] }), _jsxs("section", { className: "mb-6 grid gap-4 sm:grid-cols-2", children: [_jsx("div", { className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-500", children: "Total users" }), _jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900", children: loading && users.length === 0 ? "—" : totalUsers })] }), _jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700", children: _jsx(Users, { size: 22 }) })] }) }), _jsx("div", { className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-slate-500", children: "Recently added" }), _jsx("p", { className: "mt-2 truncate text-lg font-semibold text-slate-900", children: latestUser?.name ?? "No users yet" }), _jsx("p", { className: "mt-0.5 truncate text-xs text-slate-500", children: latestUser?.email ?? "Add your first user to get started" })] }), _jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700", children: _jsx(UserRoundPlus, { size: 22 }) })] }) })] }), _jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft", children: [_jsxs("div", { className: "flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-slate-900", children: "All users" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Manage your user records." })] }), _jsxs("div", { className: "flex w-full gap-2 sm:w-auto", children: [_jsxs("div", { className: "relative min-w-0 flex-1 sm:w-72", children: [_jsx(Search, { size: 17, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: "search", value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search name, email or phone...", className: "form-input pl-9" }), search && (_jsx("button", { type: "button", onClick: () => setSearch(""), "aria-label": "Clear search", className: "absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700", children: _jsx(X, { size: 15 }) }))] }), _jsx("button", { type: "button", onClick: () => void fetchUsers(search.trim()), disabled: loading, title: "Refresh users", "aria-label": "Refresh users", className: "rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50", children: _jsx(RefreshCw, { size: 17, className: loading ? "animate-spin" : "" }) })] })] }), pageError && (_jsxs("div", { className: "m-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700", children: [_jsx(AlertCircle, { size: 18, className: "mt-0.5 shrink-0" }), _jsx("div", { className: "flex-1", children: pageError }), _jsx("button", { type: "button", onClick: () => void fetchUsers(search.trim()), className: "font-semibold underline", children: "Retry" })] })), _jsx(UserTable, { users: users, loading: loading, onEdit: openEditForm, onDelete: (user) => void deleteUser(user) }), _jsxs("div", { className: "border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6", children: ["Showing ", users.length, " ", users.length === 1 ? "user" : "users", search ? ` matching “${search}”` : ""] })] }), _jsx("footer", { className: "py-6 text-center text-xs text-slate-400", children: "User Management CRUD \u00B7 Next.js \u00B7 Drizzle ORM \u00B7 PostgreSQL" })] }), formOpen && (_jsx(UserForm, { user: selectedUser, saving: saving, onClose: () => {
                    if (!saving) {
                        setFormOpen(false);
                        setSelectedUser(null);
                    }
                }, onSubmit: saveUser }, selectedUser?.id ?? "new-user")), notice && (_jsxs("div", { role: "status", className: `fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${notice.type === "success"
                    ? "border-emerald-200 bg-white text-emerald-800"
                    : "border-rose-200 bg-white text-rose-800"}`, children: [_jsx("span", { className: `h-2 w-2 rounded-full ${notice.type === "success" ? "bg-emerald-500" : "bg-rose-500"}` }), notice.text, _jsx("button", { type: "button", onClick: () => setNotice(null), "aria-label": "Dismiss notification", className: "ml-2 text-slate-400 hover:text-slate-700", children: _jsx(X, { size: 15 }) })] }))] }));
}
