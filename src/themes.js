export const THEMES = [
  {
    id: "aurora",
    name: "星海霓虹",
    tag: "科技感",
    description: "深色网格、青紫辉光，适合数码与产品发布。",
    colors: {
      bg: "07111F",
      surface: "0E1D2D",
      text: "F5F8FF",
      muted: "A7B6C8",
      accent: "68E4FF",
      accent2: "B98EFF",
      line: "27445B",
      shadow: "02070D",
    },
    radius: 18,
  },
  {
    id: "gold",
    name: "工业鎏金",
    tag: "专业测评",
    description: "暖金与鼠尾草绿，延续原有专业测评模板。",
    colors: {
      bg: "171612",
      surface: "24221B",
      text: "F4F0E8",
      muted: "B7B0A3",
      accent: "D6B25B",
      accent2: "9EB39A",
      line: "4A4437",
      shadow: "090805",
    },
    radius: 10,
  },
  {
    id: "clean",
    name: "极简商务",
    tag: "汇报通用",
    description: "克制留白与高对比蓝，适合正式汇报和路演。",
    colors: {
      bg: "F7F7F4",
      surface: "FFFFFF",
      text: "15171C",
      muted: "667085",
      accent: "2B57FF",
      accent2: "8AA0FF",
      line: "D9DDE7",
      shadow: "25324A",
    },
    radius: 8,
  },
  {
    id: "coral",
    name: "日落杂志",
    tag: "视觉提案",
    description: "珊瑚红、奶油色与大胆构图，更具编辑感。",
    colors: {
      bg: "B83E37",
      surface: "C94A40",
      text: "FFF5DE",
      muted: "F3C8B5",
      accent: "FF9B56",
      accent2: "FFD48A",
      line: "DE786D",
      shadow: "5A1818",
    },
    radius: 24,
  },
  {
    id: "forest",
    name: "森系自然",
    tag: "生活方式",
    description: "苔绿与柔和米白，适合家居、生活和可持续主题。",
    colors: {
      bg: "EEEDE4",
      surface: "F9F8F1",
      text: "183F36",
      muted: "687A70",
      accent: "4F7C68",
      accent2: "A5BF8D",
      line: "CBD4C9",
      shadow: "1A332C",
    },
    radius: 22,
  },
  {
    id: "blueprint",
    name: "蓝图数据",
    tag: "结构分析",
    description: "工程网格与清晰线框，适合参数、数据和方案拆解。",
    colors: {
      bg: "092C56",
      surface: "0E3A6D",
      text: "EDF8FF",
      muted: "A9CBE1",
      accent: "70DAFF",
      accent2: "D1F5FF",
      line: "3A6790",
      shadow: "03182F",
    },
    radius: 4,
  },
];

export const THEME_MAP = Object.fromEntries(THEMES.map((theme) => [theme.id, theme]));

export function cssThemeVariables(theme) {
  const { colors } = theme;
  return {
    "--slide-bg": `#${colors.bg}`,
    "--slide-surface": `#${colors.surface}`,
    "--slide-text": `#${colors.text}`,
    "--slide-muted": `#${colors.muted}`,
    "--slide-accent": `#${colors.accent}`,
    "--slide-accent-2": `#${colors.accent2}`,
    "--slide-line": `#${colors.line}`,
    "--slide-shadow": `#${colors.shadow}`,
    "--slide-radius": `${theme.radius}px`,
  };
}

export function applyVariables(element, variables) {
  Object.entries(variables).forEach(([name, value]) => element.style.setProperty(name, value));
}
