export default async function handler(req, res) {
  console.log("📩 Request received:", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const input = req.body.keyword || 'No keyword received';
  console.log("🧠 Input keyword:", input);

  const token = process.env.QIANFAN_TOKEN;
  if (!token) {
    console.error("❌ Missing QIANFAN_TOKEN environment variable");
    return res.status(500).json({ error: "Missing QIANFAN_TOKEN environment variable" });
  } else {
    console.log("✅ QIANFAN_TOKEN detected, length:", token.length);
  }

  try {
    const response = await fetch(
      'https://appbuilder.baidu.com/v2/tools/components/c-wf-13ebc135-326f-47b6-b713-ba2373d8b095/version/2/mcp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Appbuilder-Token': token
        },
        body: JSON.stringify({ input: input })
      }
    );

    console.log("🌐 Sent request to Qianfan API, waiting for response...");

    const data = await response.text(); // 改为 text() 防止 JSON 解析出错
    console.log("✅ Qianfan API response:", data);

    return res.status(200).json({ fromQianfan: data });
  } catch (error) {
    console.error("🔥 Error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
}
