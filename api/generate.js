export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const keyword = req.body.keyword || "No keyword provided";
  const token = process.env.QIANFAN_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "Missing QIANFAN_TOKEN environment variable" });
  }

  try {
    const response = await fetch(
      "https://qianfan.baidubce.com/v2/components/c-wf-130cb135-326f-4b76-b713-ba2373d8b056/version/latest?action=tool_eval",
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
            _sys_chat_history: [
              { role: "user", content: keyword }
            ],
            input_variable_name: "keyword"
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

    return res.status(200).json({ fromQianfan: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
}
