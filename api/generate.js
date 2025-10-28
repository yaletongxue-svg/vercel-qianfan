export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const input = req.body.keyword || 'No keyword received';
  const token = process.env.QIANFAN_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "Missing QIANFAN_TOKEN environment variable" });
  }

  try {
    const response = await fetch(
      'https://appbuilder.baidu.com/v2/tools/components/c-wf-13ebc135-326f-47b6-b713-ba2373d8b095/version/2/mcp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "test",
          method: "invoke",
          params: { input }
        })
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
}
