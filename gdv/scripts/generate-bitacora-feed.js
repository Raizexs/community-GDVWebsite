const fs = require("fs");
const path = require("path");

const postsPath = path.join(__dirname, "../src/data/bitacoraPosts.json");
const outputPath = path.join(__dirname, "../public/noticias/feed.xml");
const siteUrl = "https://www.gdvalparaiso.com";

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildFeed(posts) {
  const published = posts
    .filter((post) => post.published !== false)
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));

  const items = published
    .map((post) => {
      const title = escapeXml(post.title?.es || post.title?.en || post.slug);
      const description = escapeXml(
        post.excerpt?.es || post.excerpt?.en || "",
      );
      const link = `${siteUrl}/noticias/${post.slug}`;
      const pubDate = new Date(`${post.publishedAt}T12:00:00Z`).toUTCString();

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  const lastBuildDate =
    published[0]?.publishedAt
      ? new Date(`${published[0].publishedAt}T12:00:00Z`).toUTCString()
      : new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Noticias GDV</title>
    <link>${siteUrl}/noticias</link>
    <description>Noticias del Gremio de Desarrolladores de Valparaíso</description>
    <language>es-cl</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

const posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buildFeed(posts), "utf8");
console.log(`Generated ${outputPath}`);
