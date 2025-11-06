export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const domain = req.query.domain;
  if (!domain) return res.status(400).json({ error: "Thiếu domain" });

  const clean = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/")[0];
  const tld = clean.split(".").pop().toLowerCase();

  const servers = {
    com: "https://rdap.verisign.com/com/v1/domain/",
    net: "https://rdap.verisign.com/net/v1/domain/",
    org: "https://rdap.publicinterestregistry.net/rdap/org/domain/",
    info: "https://rdap.afilias.net/rdap/info/domain/",
    biz: "https://rdap.neustar.biz/domain/",
    xyz: "https://rdap.nic.xyz/domain/",
    io: "https://rdap.nic.io/domain/",
    dev: "https://rdap.googleapis.com/domain/",
    app: "https://rdap.googleapis.com/domain/",
    me: "https://rdap.nic.me/domain/",
    us: "https://rdap.neustar.biz/domain/",
    uk: "https://rdap.nominet.uk/domain/",
    ca: "https://rdap.ca.fury.ca/domain/",
    jp: "https://rdap.jprs.jp/domain/",
    vn: "https://rdap.vnnic.vn/rdap/domain/"
  };

  const rdapUrl = (servers[tld] || "https://rdap.org/domain/") + clean;

  try {
    const response = await fetch(rdapUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (RDAP Proxy via Vercel)" },
    });

    const status = response.status;
    const data = await response.json().catch(() => ({}));

    return res.status(status).json({
      domain: clean,
      status,
      source: rdapUrl,
      data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, note: "Fetch RDAP thất bại" });
  }
}
