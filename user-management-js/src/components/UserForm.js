"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
export default function UserForm({ user, saving, onClose, onSubmit, }) {
    const [values, setValues] = useState({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        age: user?.age === null || user?.age === undefined ? "" : String(user.age),
    });
    const [error, setError] = useState("");
    function updateField(field, value) {
        setValues((current) => ({ ...current, [field]: value }));
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        if (values.name.trim().length < 2) {
            setError("Name must contain at least 2 characters.");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
            setError("Enter a valid email address.");
            return;
        }
        if (values.age && (!Number.isInteger(Number(values.age)) || Number(values.age) < 0 || Number(values.age) > 130)) {
            setError("Enter an age between 0 and 130.");
            return;
        }
        try {
            await onSubmit({
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                phone: values.phone.trim(),
                age: values.age.trim(),
            });
        }
        catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
        }
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm", onMouseDown: (event) => {
            if (event.target === event.currentTarget && !saving)
                onClose();
        }, children: _jsxs("div", { className: "w-full max-w-lg rounded-2xl bg-white shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 px-6 py-5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: user ? "Edit user" : "Add new user" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Enter the user's information below." })] }), _jsx("button", { type: "button", onClick: onClose, disabled: saving, "aria-label": "Close form", className: "rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50", children: _jsx(X, { size: 19 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 px-6 py-6", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "name", className: "mb-1.5 block text-sm font-medium text-slate-700", children: ["Full name ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { id: "name", required: true, autoFocus: true, maxLength: 150, value: values.name, onChange: (event) => updateField("name", event.target.value), placeholder: "e.g. Rahul Sharma", className: "form-input" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "email", className: "mb-1.5 block text-sm font-medium text-slate-700", children: ["Email address ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { id: "email", type: "email", required: true, maxLength: 255, value: values.email, onChange: (event) => updateField("email", event.target.value), placeholder: "rahul@example.com", className: "form-input" })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Phone number" }), _jsx("input", { id: "phone", type: "tel", maxLength: 30, value: values.phone, onChange: (event) => updateField("phone", event.target.value), placeholder: "9876543210", className: "form-input" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "age", className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Age" }), _jsx("input", { id: "age", type: "number", min: "0", max: "130", step: "1", value: values.age, onChange: (event) => updateField("age", event.target.value), placeholder: "e.g. 28", className: "form-input" })] })] }), error && (_jsx("div", { role: "alert", className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700", children: error })), _jsxs("div", { className: "flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end", children: [_jsx("button", { type: "button", onClick: onClose, disabled: saving, className: "btn-secondary", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: saving, className: "btn-primary", children: [saving ? _jsx(Loader2, { size: 17, className: "animate-spin" }) : null, saving ? "Saving..." : user ? "Save changes" : "Add user"] })] })] })] }) }));
}
