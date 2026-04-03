import { useEffect, useState } from "react";
import { API } from "../api";
import Layout from "../components/Layout";

export default function Suggestions() {
  const [data, setData] = useState(null);

  const projectId = localStorage.getItem("projectId");

  useEffect(() => {
    if (!projectId) return;

    API.get(`/api/suggestions/${projectId}`)
      .then((res) => setData(res.data))
      .catch(console.error);
  }, []);

  if (!data) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h1>Suggestions</h1>

      {data.suggestions?.map((s, i) => (
        <div key={i}>
          <h3>{s.attackType}</h3>
          <p>Occurrences: {s.occurrences}</p>
          <ul>
            {s.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      ))}
    </Layout>
  );
}