
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, Package, X } from "lucide-react";

const API = "http://localhost:3000";

export default function App() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const data = tab === "users" ? users : products;

  async function loadData() {
    try {
      const [u, p] = await Promise.all([
        fetch(`${API}/users`),
        fetch(`${API}/products`)
      ]);
      if (!u.ok || !p.ok) throw new Error("Cannot connect to JSON Server.");
      setUsers(await u.json());
      setProducts(await p.json());
      setError("");
    } catch (e) {
      setError(e.message + " Run npm run api in another terminal.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function addRecord() {
    setEditing(null);
    setForm(
      tab === "users"
        ? { name: "", email: "", role: "User" }
        : { name: "", price: "", stock: "" }
    );
    setError("");
    setShowForm(true);
  }

  function editRecord(item) {
    setEditing(item.id);
    setForm({ ...item });
    setError("");
    setShowForm(true);
  }

  async function saveRecord(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = tab === "users"
        ? {
            name: String(form.name || "").trim(),
            email: String(form.email || "").trim(),
            role: form.role || "User"
          }
        : {
            name: String(form.name || "").trim(),
            price: Number(form.price),
            stock: Number(form.stock)
          };

      if (!payload.name) throw new Error("Enter a name.");

      if (tab === "users" && !payload.email) {
        throw new Error("Enter an email.");
      }

      if (
        tab === "products" &&
        (form.price === "" || form.stock === "" ||
          !Number.isFinite(payload.price) ||
          !Number.isFinite(payload.stock) ||
          payload.price < 0 || payload.stock < 0)
      ) {
        throw new Error("Enter a valid price and stock.");
      }

      const response = await fetch(
        `${API}/${tab}${editing !== null ? `/${editing}` : ""}`,
        {
          method: editing !== null ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error("Save failed.");

      setShowForm(false);
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(item) {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    try {
      const response = await fetch(`${API}/${tab}/${item.id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Delete failed.");
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = data.filter(item =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Users & Products</h1>
      <p>Manage your records with simple API operations.</p>

      <div style={{ display: "flex", gap: 10, margin: "25px 0" }}>
        <button onClick={() => { setTab("users"); setShowForm(false); setSearch(""); }}>
          <Users size={16} /> Users ({users.length})
        </button>
        <button onClick={() => { setTab("products"); setShowForm(false); setSearch(""); }}>
          <Package size={16} /> Products ({products.length})
        </button>
      </div>

      {error && (
        <p style={{ color: "crimson" }}>
          {error} <button onClick={() => setError("")}>Dismiss</button>
        </p>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 10, flex: 1 }}
        />
        <button onClick={addRecord}><Plus size={16} /> Add {tab === "users" ? "User" : "Product"}</button>
        <button onClick={loadData}>Refresh</button>
      </div>

      {showForm && (
        <form onSubmit={saveRecord} style={{ padding: 20, border: "1px solid #ddd", borderRadius: 10, marginBottom: 20 }}>
          <h3>{editing !== null ? "Edit" : "Add"} {tab === "users" ? "User" : "Product"}</h3>
          <label>
            Name
            <input required value={form.name ?? ""} onChange={e => setForm({ ...form, name: e.target.value })} style={{ display: "block", width: "100%", padding: 10, margin: "8px 0 15px" }} />
          </label>

          {tab === "users" ? (
            <>
              <label>Email
                <input type="email" required value={form.email ?? ""} onChange={e => setForm({ ...form, email: e.target.value })} style={{ display: "block", width: "100%", padding: 10, margin: "8px 0 15px" }} />
              </label>
              <label>Role
                <select value={form.role ?? "User"} onChange={e => setForm({ ...form, role: e.target.value })} style={{ display: "block", padding: 10, margin: "8px 0 15px" }}>
                  <option>User</option>
                  <option>Admin</option>
                  <option>Developer</option>
                  <option>Designer</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label>Price
                <input type="number" min="0" step="0.01" required value={form.price ?? ""} onChange={e => setForm({ ...form, price: e.target.value })} style={{ display: "block", width: "100%", padding: 10, margin: "8px 0 15px" }} />
              </label>
              <label>Stock
                <input type="number" min="0" step="1" required value={form.stock ?? ""} onChange={e => setForm({ ...form, stock: e.target.value })} style={{ display: "block", width: "100%", padding: 10, margin: "8px 0 15px" }} />
              </label>
            </>
          )}

          <button disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={() => setShowForm(false)}><X size={14} /> Cancel</button>
        </form>
      )}

      <div style={{ overflowX: "auto" }}>
        <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f0f3f8" }}>
              <th>ID</th><th>Name</th>
              {tab === "users"
                ? <><th>Email</th><th>Role</th></>
                : <><th>Price</th><th>Stock</th></>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                {tab === "users"
                  ? <><td>{item.email}</td><td>{item.role}</td></>
                  : <><td>₹{item.price}</td><td>{item.stock}</td></>}
                <td>
                  <button onClick={() => editRecord(item)} title="Edit"><Pencil size={15} /></button>{" "}
                  <button onClick={() => deleteRecord(item)} title="Delete"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
