
export default function ResponseViewer({ response }) {
  if (!response) {
    return (
      <section className="panel empty-response">
        <div className="empty-icon">{ }</div>
        <h2>API Response</h2>
        <p>Send a request to inspect the response here.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RESPONSE INSPECTOR</span>
          <h2>API Response</h2>
        </div>

        <span className={response.ok ? "status-success" : "status-error"}>
          {response.status ?? "Network Error"}
        </span>
      </div>

      <div className="response-metrics">
        <div>
          <span>Status</span>
          <strong>{response.statusText || response.error || "Error"}</strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>{response.duration} ms</strong>
        </div>
      </div>

      <details>
        <summary>Response headers</summary>
        <pre className="response-code">
          {JSON.stringify(response.headers, null, 2)}
        </pre>
      </details>

      <div className="response-title">Response body</div>
      <pre className="response-code">
        {JSON.stringify(
          response.data ?? { error: response.error || "Empty response" },
          null,
          2
        )}
      </pre>
    </section>
  );
}
