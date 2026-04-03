export default function Credentials() {
  const apiKey = localStorage.getItem("apiKey");
  const projectId = localStorage.getItem("projectId");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Credentials</h1>

      <p>API Key: {apiKey}</p>
      <p>Project ID: {projectId}</p>

      <button onClick={() => navigator.clipboard.writeText(apiKey)}>
        Copy API Key
      </button>

      <pre style={{ marginTop: "20px" }}>
{`npm install threatlens-sdk

app.use(threatLens({
  apiKey: '${apiKey}',
  projectId: '${projectId}'
}))`}
      </pre>
    </div>
  );
}