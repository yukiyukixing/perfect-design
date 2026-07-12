export const DEFAULT_REVIEW = {
  styleId: "study-infographic",
  title: "作业帮 S50 学练机",
  brand: "B站专业数码评测",
  price: "2815元起（256G）",
  specs: `AI系统|银河大模型 + DeepSeek
课程教材|302个教材版本同步学习
作业辅导|封闭式系统 + 薄弱诊断
练习资源|28亿题库 + 770万套真题卷
屏幕硬件|10.3英寸高刷类墨水屏
硬件外设|4096级磁吸主动电容笔`,
  audience: "适合已经有自学能力，希望减少娱乐干扰的中学生",
  pros: `护眼、专注、防沉迷
适合刷题和自主学习`,
  cons: `不适合视频网课
黑白显示体验单一`,
  comment: "产品链接置顶在评论区",
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
    price: sections["价格"]?.join(" ") || sections["产品价格"]?.join(" ") || fallback.price,
    specs: sections["核心参数"]?.join("\n") || fallback.specs,
    audience: sections["适用人群"]?.join(" ") || fallback.audience,
    pros: sections["优点"]?.join("\n") || sections["亮点"]?.join("\n") || fallback.pros,
    cons: sections["缺点"]?.join("\n") || sections["注意点"]?.join("\n") || fallback.cons,
    comment: sections["评论区提示"]?.join(" ") || sections["评论提示"]?.join(" ") || fallback.comment,
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
  if (String(review.price || "").trim().length > 24) errors.push("产品价格请控制在 24 个字符以内");
  if (!specs.length) errors.push("请至少填写 1 项核心参数");
  if (specs.length > 10) errors.push("原版参数区最多容纳 10 项参数");
  if (specs.some(({ label }) => label.length > 10)) errors.push("参数名请控制在 10 个字符以内");
  if (specs.some(({ value }) => value.length > 28)) errors.push("单项参数值请控制在 28 个字符以内");
  if (!String(review.audience || "").trim()) errors.push("请填写适用人群");
  if (String(review.audience || "").trim().length > 46) errors.push("适用人群请控制在 46 个字符以内");
  if (!pros.length || !cons.length) errors.push("优点和缺点都至少填写 1 条");
  if (pros.length > 3 || cons.length > 3) errors.push("原版优缺点区域各最多容纳 3 条");
  if ([...pros, ...cons].some((line) => line.length > 18)) errors.push("单条优点或缺点请控制在 18 个字符以内");
  if (String(review.comment || "").trim().length > 22) errors.push("评论区提示请控制在 22 个字符以内");
  return errors;
}
