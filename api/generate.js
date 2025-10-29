export default async function handler(req, res) {
  // ===== 1. 处理 CORS 预检 =====
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end(); // 关键：必须返回 200
  }

  // ===== 2. 设置跨域头（所有响应都带） =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // ===== 3. 限制只允许 POST =====
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // ===== 4. 安全读取 req.body =====
  let keyword = "No keyword provided";
  try {
    if (req.body) {
      if (typeof req.body === "string") {
        const parsed = JSON.parse(req.body);
        keyword = parsed.keyword || "No keyword provided";
      } else if (req.body.keyword) {
        keyword = req.body.keyword;
      }
    }
  } catch (err) {
    console.error("Invalid body:", err);
  }

  const token = process.env.QIANFAN_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Missing QIANFAN_TOKEN environment variable" });
  }

  try {
    const response = await fetch(
      "https://qianfan.baidu.com/v2/components/c-wf-130cb135-326f-4b76-b713-ba2373d8b056/version/latest?action=tool_eval",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stream: false,
          parameters: {
            _sys_origin_query: keyword,
            _sys_file_urls: {},
            _sys_end_user_id: "mystictiming_user",
            _sys_chat_history: [{ role: "user", content: keyword }],
            input_variable_name: "keyword",
          },
        }),
      }
    );

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Invalid JSON response", raw: text });
    }

    return res.status(200).json({
      ok: true,
      source: "qianfan",
      data,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
