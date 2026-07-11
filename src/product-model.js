export const DEFAULT_REVIEW = {
  styleId: "gold",
  title: "竞技上分利器：UG25HF",
  brand: "咕嘎咕嘎研究所",
  specs: `名称|UG25HF
面板|TN
响应时间|0.5ms
分辨率|1920*1080
屏幕刷新率|500Hz
屏幕尺寸|24.1英寸
亮度|350cd/㎡
产品净重|5.2kg
类型|直面屏
屏幕比例|16:9`,
  audience: "适合重度FPS玩家，追求毫秒级优势的玩家",
  pros: `性能堆得很满
屏幕规格豪华
做工与易用性细节`,
  cons: `便携性一般
标配内存偏保守
高刷与高分对续航有压`,
};

export function parseListLines(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^[-*•›]\s*/, "").trim())
    .filter(Boolean);
}

export function parseSpecLines(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => {
      const separator = line.indexOf("|");
      if (separator < 1) return null;
      const label = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      return label && value ? { label, value } : null;
    })
    .filter(Boolean);
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

export function parseProductConfig(text, fallback = DEFAULT_REVIEW) {
  const sections = parseBracketSections(text);
  if (!Object.keys(sections).length) throw new Error("没有识别到 [标题]、[核心参数] 等配置分区");
  return {
    title: sections["标题"]?.join(" ") || fallback.title,
    brand: sections["品牌"]?.join(" ") || sections["账号"]?.join(" ") || fallback.brand,
    specs: sections["核心参数"]?.join("\n") || fallback.specs,
    audience: sections["适用人群"]?.join(" ") || fallback.audience,
    pros: sections["优点"]?.join("\n") || sections["亮点"]?.join("\n") || fallback.pros,
    cons: sections["缺点"]?.join("\n") || sections["注意点"]?.join("\n") || fallback.cons,
  };
}

export function validateReview(review) {
  const errors = [];
  const specs = parseSpecLines(review.specs);
  const pros = parseListLines(review.pros);
  const cons = parseListLines(review.cons);

  if (!String(review.title || "").trim()) errors.push("请填写页面标题");
  if (String(review.title || "").trim().length > 20) errors.push("页面标题请控制在 20 个字符以内，避免原版标题换行");
  if (String(review.brand || "").trim().length > 18) errors.push("账号 / 品牌请控制在 18 个字符以内");
  if (!specs.length) errors.push("请至少填写 1 项核心参数");
  if (specs.length > 10) errors.push("原版参数区最多容纳 10 项参数");
  if (specs.some(({ label }) => label.length > 10)) errors.push("参数名请控制在 10 个字符以内");
  if (specs.some(({ value }) => value.length > 22)) errors.push("单项参数值请控制在 22 个字符以内");
  if (!String(review.audience || "").trim()) errors.push("请填写适用人群");
  if (String(review.audience || "").trim().length > 46) errors.push("适用人群请控制在 46 个字符以内");
  if (!pros.length || !cons.length) errors.push("优点和缺点都至少填写 1 条");
  if (pros.length > 3 || cons.length > 3) errors.push("原版优缺点区域各最多容纳 3 条");
  if ([...pros, ...cons].some((line) => line.length > 18)) errors.push("单条优点或缺点请控制在 18 个字符以内");
  return errors;
}
