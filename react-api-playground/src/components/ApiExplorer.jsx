
import JsonEditor from "./JsonEditor";

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function ApiExplorer({
  method,
  setMethod,
  url,
  setUrl,
  headers,
  setHeaders,
  body,
  setBody,
  onSend,
  loading
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">REQUEST BUILDER</span>
          <h2>API Request</h2>
        </div>
        <span className="live-dot">Ready</span>
      </div>

      <div className="request-row">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className={`method-select method-${method}`}
        >
          {methods.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <input
          className="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/users"
        />

        <button
          className="primary-button send-button"
          onClick={onSend}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      <label className="field-label">Headers (JSON)</label>
      <JsonEditor value={headers} onChange={setHeaders} />

      <label className="field-label">Request body (JSON)</label>
      <JsonEditor value={body} onChange={setBody} />

      <p className="hint">
        Use a relative endpoint such as /users/1, or enter a complete URL.
        GET and DELETE requests do not require a body.
      </p>
    </section>
  );
}
