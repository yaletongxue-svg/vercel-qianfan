export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const keyword = req.body.keyword || 'No keyword received';
  const token = process.env.QIANFAN_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "Missing QIANFAN_TOKEN environment variable" });
  }

  try {
    // ✅ 关键改动1：新版 workflow 调用地址
    const response = await fetch('https://appbuilder.baidu.com/v2/workflow/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // ✅ 关键改动2：新版 body 格式
      body: JSON.stringify({
        workflow_id: 'wf-13ebc135-326f-47b6-b713-ba2373d8b095', // 改成你自己的 workflow_id
        inputs: {
          keyword: keyword
        }
      })
    });

    // 如果返回不是 JSON，提前捕获
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Response is not valid JSON", raw: text });
    }

    return res.status(200).json({ fromQianfan: data });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
}
