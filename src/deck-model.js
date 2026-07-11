export const MAX_BULLETS_PER_SLIDE = 5;

function normalizeLine(value) {
  return String(value || "")
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)、]\s*/, "")
    .trim();
}

export function parseOutline(text) {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const sections = [];
  let current = null;

  const ensureCurrent = () => {
    if (!current) {
      current = { title: "核心内容", bullets: [] };
      sections.push(current);
    }
    return current;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    const markdownHeading = line.match(/^#{1,6}\s+(.+)$/);
    const bracketHeading = line.match(/^\[([^\]]+)]\s*$/);
    if (markdownHeading || bracketHeading) {
      const title = (markdownHeading?.[1] || bracketHeading?.[1] || "章节").trim();
      current = { title, bullets: [] };
      sections.push(current);
      return;
    }

    const value = normalizeLine(line);
    if (value) ensureCurrent().bullets.push(value);
  });

  if (!sections.length) sections.push({ title: "核心内容", bullets: ["在这里补充你的演示要点"] });
  sections.forEach((section) => {
    if (!section.bullets.length) section.bullets.push("在这里补充本章节内容");
  });
  return sections;
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks.length ? chunks : [[]];
}

export function buildSlides(sections, includeClosing = true) {
  const slides = [{ type: "cover", title: "封面" }];

  sections.forEach((section, sectionIndex) => {
    const bulletChunks = chunk(section.bullets, MAX_BULLETS_PER_SLIDE);
    bulletChunks.forEach((bullets, chunkIndex) => {
      slides.push({
        type: "content",
        title: section.title,
        bullets,
        sectionIndex,
        chunkIndex,
        chunkTotal: bulletChunks.length,
      });
    });
  });

  if (sections.length >= 3) {
    slides.push({
      type: "summary",
      title: "核心回顾",
      items: sections.slice(0, 6).map((section) => ({
        title: section.title,
        text: section.bullets[0] || "待补充",
      })),
    });
  }

  if (includeClosing) slides.push({ type: "closing", title: "结束页" });
  return slides;
}

export function parseBracketSections(text) {
  const sections = {};
  let current = null;
  String(text || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .forEach((rawLine) => {
      const line = rawLine.trim();
      const heading = line.match(/^\[([^\]]+)]\s*(.*)$/);
      if (heading) {
        current = heading[1].trim();
        sections[current] ||= [];
        if (heading[2].trim()) sections[current].push(heading[2].trim());
      } else if (current && line) {
        sections[current].push(line);
      }
    });
  return sections;
}

export function convertLegacyText(text, fallback = {}) {
  const defaults = {
    title: fallback.title || "未命名演示文稿",
    subtitle: fallback.subtitle || "",
    outline: fallback.outline || "",
  };
  const sections = parseBracketSections(text);
  const keys = Object.keys(sections);
  if (!keys.length) {
    const markdownTitle = String(text).match(/^#\s+(.+)$/m)?.[1]?.trim();
    return {
      title: markdownTitle || defaults.title,
      subtitle: defaults.subtitle,
      outline: String(text || "").trim(),
    };
  }

  if (sections["标题"] || sections["核心参数"] || sections["优点"] || sections["缺点"]) {
    const outline = [];
    if (sections["核心参数"]?.length) {
      outline.push("# 核心参数");
      sections["核心参数"].forEach((line) => {
        const [label, ...rest] = line.split("|");
        outline.push(`- ${label.trim()}${rest.length ? `：${rest.join("|").trim()}` : ""}`);
      });
    }
    if (sections["适用人群"]?.length) {
      outline.push("", "# 适用人群", ...sections["适用人群"].map((line) => `- ${line}`));
    }
    if (sections["优点"]?.length) outline.push("", "# 亮点", ...sections["优点"].map((line) => `- ${line}`));
    if (sections["缺点"]?.length) outline.push("", "# 注意事项", ...sections["缺点"].map((line) => `- ${line}`));
    return {
      title: sections["标题"]?.join(" ") || defaults.title,
      subtitle: sections["适用人群"]?.join(" ") || defaults.subtitle,
      outline: outline.join("\n") || defaults.outline,
    };
  }

  const categoryKeys = keys.filter((key) => /^类别\d+/.test(key)).sort((a, b) => a.localeCompare(b, "zh-CN"));
  if (sections["主标题"] || categoryKeys.length) {
    const outline = [];
    categoryKeys.forEach((key) => {
      const fields = {};
      sections[key].forEach((line) => {
        const [name, ...rest] = line.split("|");
        if (!rest.length) return;
        fields[name.trim()] ||= [];
        fields[name.trim()].push(rest.join("|").trim());
      });
      const heading = [fields["标签"]?.[0], fields["场景"]?.[0]].filter(Boolean).join(" · ") || key;
      outline.push(`# ${heading}`);
      (fields["产品"] || []).forEach((value) => outline.push(`- 推荐：${value}`));
      (fields["高亮"] || []).forEach((value) => outline.push(`- 重点：${value}`));
      outline.push("");
    });
    return {
      title: sections["主标题"]?.join(" ") || defaults.title,
      subtitle: sections["副标题"]?.join(" ") || defaults.subtitle,
      outline: outline.join("\n").trim() || defaults.outline,
    };
  }

  return { title: defaults.title, subtitle: defaults.subtitle, outline: String(text || "").trim() };
}
