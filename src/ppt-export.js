import pptxgen from "pptxgenjs";
import { THEME_MAP } from "./themes.js";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const FONT_CN = "Microsoft YaHei";
const FONT_LATIN = "Aptos Display";

function safeFileName(value) {
  const cleaned = String(value || "星演演示文稿")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  return `${(cleaned || "星演演示文稿").slice(0, 64)}.pptx`;
}

function addText(slide, text, options = {}) {
  slide.addText(String(text || ""), {
    fontFace: FONT_CN,
    margin: 0,
    breakLine: false,
    fit: "shrink",
    valign: "mid",
    ...options,
  });
}

function addLine(slide, pptx, x, y, w, color, width = 1, transparency = 0) {
  slide.addShape(pptx.ShapeType.line, {
    x,
    y,
    w,
    h: 0,
    line: { color, width, transparency },
  });
}

function addRect(slide, pptx, options, theme, rounded = true) {
  const shape = rounded && theme.id !== "blueprint" ? pptx.ShapeType.roundRect : pptx.ShapeType.rect;
  slide.addShape(shape, options);
}

function fitContain(image, x, y, w, h, padding = 0) {
  const innerX = x + padding;
  const innerY = y + padding;
  const innerW = Math.max(0.1, w - padding * 2);
  const innerH = Math.max(0.1, h - padding * 2);
  const imageRatio = image?.width && image?.height ? image.width / image.height : innerW / innerH;
  const boxRatio = innerW / innerH;

  if (imageRatio > boxRatio) {
    const finalH = innerW / imageRatio;
    return { x: innerX, y: innerY + (innerH - finalH) / 2, w: innerW, h: finalH };
  }
  const finalW = innerH * imageRatio;
  return { x: innerX + (innerW - finalW) / 2, y: innerY, w: finalW, h: innerH };
}

function addChrome(slide, pptx, theme, index, total) {
  addText(slide, "STARDECK  /  PRESENTATION", {
    x: 0.62,
    y: 0.33,
    w: 4.2,
    h: 0.22,
    fontFace: FONT_LATIN,
    fontSize: 7.5,
    bold: true,
    charSpacing: 2.1,
    color: theme.colors.muted,
  });

  addText(slide, `${String(index + 1).padStart(2, "0")}  /  ${String(total).padStart(2, "0")}`, {
    x: 11.76,
    y: 0.3,
    w: 0.94,
    h: 0.26,
    fontFace: FONT_LATIN,
    fontSize: 8.5,
    bold: true,
    align: "right",
    color: theme.colors.text,
  });

  addLine(slide, pptx, 0.62, 0.68, 12.1, theme.colors.line, 0.7, 25);
}

function addGrid(slide, pptx, theme, step = 0.62, transparency = 82) {
  for (let x = step; x < SLIDE_W; x += step) {
    slide.addShape(pptx.ShapeType.line, {
      x,
      y: 0,
      w: 0,
      h: SLIDE_H,
      line: { color: theme.colors.accent, width: 0.35, transparency },
    });
  }
  for (let y = step; y < SLIDE_H; y += step) {
    slide.addShape(pptx.ShapeType.line, {
      x: 0,
      y,
      w: SLIDE_W,
      h: 0,
      line: { color: theme.colors.accent, width: 0.35, transparency },
    });
  }
}

function addThemeDecor(slide, pptx, theme, variant = "content") {
  slide.background = { color: theme.colors.bg };

  if (theme.id === "aurora") {
    addGrid(slide, pptx, theme, 0.82, 90);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 9.6,
      y: -1.7,
      w: 5.1,
      h: 5.1,
      fill: { color: theme.colors.accent2, transparency: 82 },
      line: { color: theme.colors.accent, transparency: 68, width: 1 },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: -1.25,
      y: 5.35,
      w: 4.5,
      h: 4.5,
      fill: { color: theme.colors.accent, transparency: 89 },
      line: { color: theme.colors.accent, transparency: 82, width: 0.7 },
    });
  } else if (theme.id === "gold") {
    slide.addShape(pptx.ShapeType.line, {
      x: 8.9,
      y: -0.2,
      w: 4.8,
      h: 5.2,
      line: { color: theme.colors.accent, transparency: 84, width: 1.4 },
    });
    addLine(slide, pptx, 9.75, 7.05, 2.25, theme.colors.accent, 1.6, 0);
    addLine(slide, pptx, 9.1, 7.05, 0.48, theme.colors.accent2, 1.6, 0);
  } else if (theme.id === "clean") {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.16,
      h: SLIDE_H,
      line: { color: theme.colors.bg, transparency: 100 },
      fill: { color: theme.colors.accent },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 10.35,
      y: -1.25,
      w: 4.3,
      h: 4.3,
      fill: { color: theme.colors.accent, transparency: 95 },
      line: { color: theme.colors.accent, transparency: 88, width: 16 },
    });
  } else if (theme.id === "coral") {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 9.6,
      y: -2.25,
      w: 5.3,
      h: 5.3,
      fill: { color: theme.colors.accent, transparency: 0 },
      line: { color: theme.colors.bg, transparency: 100 },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: -2,
      y: 5.3,
      w: 5.5,
      h: 5.5,
      fill: { color: theme.colors.bg, transparency: 100 },
      line: { color: theme.colors.text, transparency: 85, width: 14 },
    });
  } else if (theme.id === "forest") {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 10.25,
      y: -1.7,
      w: 4.4,
      h: 4.4,
      rotate: 18,
      fill: { color: theme.colors.accent2, transparency: 68 },
      line: { color: theme.colors.bg, transparency: 100 },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: -1.8,
      y: 5.55,
      w: 4.8,
      h: 4.8,
      fill: { color: theme.colors.accent, transparency: 91 },
      line: { color: theme.colors.bg, transparency: 100 },
    });
  } else if (theme.id === "blueprint") {
    addGrid(slide, pptx, theme, 0.42, 91);
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.34,
      y: 0.34,
      w: 12.65,
      h: 6.82,
      fill: { color: theme.colors.bg, transparency: 100 },
      line: { color: theme.colors.accent, transparency: 70, width: 0.8 },
    });
    addText(slide, variant === "cover" ? "A-01" : "D-02", {
      x: 11.85,
      y: 6.82,
      w: 0.8,
      h: 0.2,
      fontFace: FONT_LATIN,
      fontSize: 6.5,
      bold: true,
      align: "right",
      charSpacing: 1.6,
      color: theme.colors.accent,
    });
  }
}

function addCoverSlide(pptx, deck, slideModel, theme, index, total) {
  const slide = pptx.addSlide();
  addThemeDecor(slide, pptx, theme, "cover");
  addChrome(slide, pptx, theme, index, total);

  addLine(slide, pptx, 0.82, 1.32, 0.42, theme.colors.accent, 3, 0);
  addText(slide, "IDEA  /  STORY  /  IMPACT", {
    x: 1.4,
    y: 1.18,
    w: 4.9,
    h: 0.3,
    fontFace: FONT_LATIN,
    fontSize: 9.5,
    bold: true,
    charSpacing: 2.2,
    color: theme.colors.accent,
  });

  const hasImage = Boolean(deck.coverImage?.dataUrl);
  const titleWidth = hasImage ? 6.8 : 7.55;
  const titleSize = deck.title.length > 24 ? 29 : deck.title.length > 14 ? 35 : 42;
  addText(slide, deck.title, {
    x: 0.82,
    y: 1.65,
    w: titleWidth,
    h: 2.15,
    fontSize: titleSize,
    bold: true,
    color: theme.colors.text,
    breakLine: true,
    valign: "mid",
  });

  addText(slide, deck.subtitle, {
    x: 0.84,
    y: 4.02,
    w: hasImage ? 6.3 : 7.2,
    h: 0.85,
    fontSize: 16,
    color: theme.colors.muted,
    breakLine: true,
    valign: "top",
  });

  addText(slide, deck.presenter || "STARDECK", {
    x: 0.84,
    y: 6.34,
    w: 3.4,
    h: 0.26,
    fontSize: 9.5,
    bold: true,
    charSpacing: 1.2,
    color: theme.colors.muted,
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 4.34,
    y: 6.43,
    w: 0.06,
    h: 0.06,
    line: { color: theme.colors.bg, transparency: 100 },
    fill: { color: theme.colors.accent },
  });
  addText(slide, String(new Date().getFullYear()), {
    x: 4.58,
    y: 6.34,
    w: 0.85,
    h: 0.26,
    fontFace: FONT_LATIN,
    fontSize: 9.5,
    bold: true,
    color: theme.colors.muted,
  });

  addRect(
    slide,
    pptx,
    {
      x: 8.65,
      y: 1.28,
      w: 3.83,
      h: 4.93,
      fill: { color: theme.colors.surface, transparency: 2 },
      line: { color: theme.colors.line, transparency: 8, width: 1 },
    },
    theme,
  );

  if (hasImage) {
    const imageBox = fitContain(deck.coverImage, 8.8, 1.43, 3.53, 4.63, 0.08);
    slide.addImage({ data: deck.coverImage.dataUrl, ...imageBox });
  } else {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 9.25,
      y: 2.05,
      w: 2.58,
      h: 2.58,
      fill: { color: theme.colors.accent, transparency: 94 },
      line: { color: theme.colors.accent, transparency: 38, width: 1 },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 9.58,
      y: 2.38,
      w: 1.92,
      h: 1.92,
      fill: { color: theme.colors.bg, transparency: 100 },
      line: { color: theme.colors.accent2, transparency: 50, width: 8 },
    });
    addText(slide, "01", {
      x: 9.25,
      y: 2.63,
      w: 2.58,
      h: 1.05,
      fontFace: FONT_LATIN,
      fontSize: 43,
      bold: true,
      align: "center",
      color: theme.colors.text,
    });
    addText(slide, "PRESENT WITH CLARITY", {
      x: 9.1,
      y: 5.45,
      w: 2.88,
      h: 0.24,
      fontFace: FONT_LATIN,
      fontSize: 6.5,
      bold: true,
      align: "center",
      charSpacing: 1.6,
      color: theme.colors.muted,
    });
  }

  return slide;
}

function addContentSlide(pptx, deck, slideModel, theme, index, total) {
  const slide = pptx.addSlide();
  addThemeDecor(slide, pptx, theme, "content");
  addChrome(slide, pptx, theme, index, total);

  const sectionNumber = String(slideModel.sectionIndex + 1).padStart(2, "0");
  addText(slide, sectionNumber, {
    x: 0.66,
    y: 1.28,
    w: 1.05,
    h: 0.75,
    fontFace: FONT_LATIN,
    fontSize: 32,
    bold: true,
    color: theme.colors.accent,
  });
  addLine(slide, pptx, 0.68, 2.22, 1.0, theme.colors.line, 0.8, 10);
  addText(slide, "SECTION", {
    x: 0.68,
    y: 2.42,
    w: 0.22,
    h: 1.2,
    fontFace: FONT_LATIN,
    fontSize: 6.5,
    bold: true,
    charSpacing: 1.7,
    vert: "vert270",
    color: theme.colors.muted,
  });

  addText(slide, "KEY MESSAGE", {
    x: 2.05,
    y: 1.12,
    w: 2.1,
    h: 0.2,
    fontFace: FONT_LATIN,
    fontSize: 7.2,
    bold: true,
    charSpacing: 2,
    color: theme.colors.accent,
  });
  addText(slide, slideModel.title, {
    x: 2.05,
    y: 1.38,
    w: 8.7,
    h: 0.68,
    fontSize: slideModel.title.length > 20 ? 25 : 30,
    bold: true,
    color: theme.colors.text,
  });
  addText(slide, `${String(slideModel.chunkIndex + 1).padStart(2, "0")} / ${String(slideModel.chunkTotal).padStart(2, "0")}`, {
    x: 11.25,
    y: 1.55,
    w: 1.35,
    h: 0.22,
    fontFace: FONT_LATIN,
    fontSize: 7.2,
    bold: true,
    align: "right",
    charSpacing: 1,
    color: theme.colors.muted,
  });
  addLine(slide, pptx, 2.05, 2.16, 10.55, theme.colors.line, 0.8, 8);

  const bullets = slideModel.bullets.slice(0, 5);
  const count = Math.max(1, bullets.length);
  const availableHeight = 4.42;
  const gap = count > 4 ? 0.14 : 0.2;
  const itemHeight = Math.min(0.86, (availableHeight - gap * (count - 1)) / count);
  const startY = 2.42;

  bullets.forEach((bullet, bulletIndex) => {
    const y = startY + bulletIndex * (itemHeight + gap);
    addRect(
      slide,
      pptx,
      {
        x: 2.05,
        y,
        w: 10.55,
        h: itemHeight,
        fill: { color: theme.colors.surface, transparency: theme.id === "clean" || theme.id === "forest" ? 0 : 6 },
        line: { color: theme.colors.line, transparency: 8, width: 0.75 },
      },
      theme,
    );
    addRect(
      slide,
      pptx,
      {
        x: 2.05,
        y,
        w: 0.75,
        h: itemHeight,
        fill: { color: theme.colors.accent, transparency: theme.id === "coral" ? 0 : 88 },
        line: { color: theme.colors.line, transparency: 20, width: 0.5 },
      },
      theme,
      false,
    );
    addText(slide, String(bulletIndex + 1).padStart(2, "0"), {
      x: 2.08,
      y: y + 0.02,
      w: 0.69,
      h: itemHeight - 0.04,
      fontFace: FONT_LATIN,
      fontSize: 8.5,
      bold: true,
      align: "center",
      color: theme.id === "coral" ? theme.colors.text : theme.colors.accent,
    });
    addText(slide, bullet, {
      x: 3.06,
      y: y + 0.08,
      w: 9.15,
      h: itemHeight - 0.16,
      fontSize: bullet.length > 52 ? 13 : bullet.length > 34 ? 15 : 17,
      bold: false,
      color: theme.colors.text,
      breakLine: true,
      valign: "mid",
    });
  });

  return slide;
}

function addSummarySlide(pptx, deck, slideModel, theme, index, total) {
  const slide = pptx.addSlide();
  addThemeDecor(slide, pptx, theme, "summary");
  addChrome(slide, pptx, theme, index, total);

  addText(slide, "RECAP  /  TAKEAWAYS", {
    x: 0.8,
    y: 1.02,
    w: 3.4,
    h: 0.25,
    fontFace: FONT_LATIN,
    fontSize: 8,
    bold: true,
    charSpacing: 2.1,
    color: theme.colors.accent,
  });
  addText(slide, "核心回顾", {
    x: 0.8,
    y: 1.35,
    w: 4.3,
    h: 0.68,
    fontSize: 31,
    bold: true,
    color: theme.colors.text,
  });
  addText(slide, String(slideModel.items.length).padStart(2, "0"), {
    x: 11.2,
    y: 1.18,
    w: 1.4,
    h: 0.8,
    fontFace: FONT_LATIN,
    fontSize: 36,
    bold: true,
    align: "right",
    color: theme.colors.accent,
    transparency: 20,
  });
  addLine(slide, pptx, 0.8, 2.18, 11.8, theme.colors.line, 0.8, 8);

  const items = slideModel.items.slice(0, 6);
  items.forEach((item, itemIndex) => {
    const col = itemIndex % 2;
    const row = Math.floor(itemIndex / 2);
    const x = 0.8 + col * 6.0;
    const y = 2.48 + row * 1.34;
    addRect(
      slide,
      pptx,
      {
        x,
        y,
        w: 5.72,
        h: 1.08,
        fill: { color: theme.colors.surface, transparency: theme.id === "clean" || theme.id === "forest" ? 0 : 5 },
        line: { color: theme.colors.line, transparency: 7, width: 0.75 },
      },
      theme,
    );
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.25,
      y: y + 0.24,
      w: 0.46,
      h: 0.46,
      fill: { color: theme.colors.accent },
      line: { color: theme.colors.bg, transparency: 100 },
    });
    addText(slide, String(itemIndex + 1).padStart(2, "0"), {
      x: x + 0.25,
      y: y + 0.25,
      w: 0.46,
      h: 0.44,
      fontFace: FONT_LATIN,
      fontSize: 6.5,
      bold: true,
      align: "center",
      color: theme.colors.bg,
    });
    addText(slide, item.title, {
      x: x + 0.95,
      y: y + 0.17,
      w: 4.35,
      h: 0.28,
      fontSize: 12.5,
      bold: true,
      color: theme.colors.text,
    });
    addText(slide, item.text, {
      x: x + 0.95,
      y: y + 0.52,
      w: 4.35,
      h: 0.34,
      fontSize: item.text.length > 34 ? 8.5 : 10,
      color: theme.colors.muted,
      valign: "top",
    });
  });

  return slide;
}

function addClosingSlide(pptx, deck, slideModel, theme, index, total) {
  const slide = pptx.addSlide();
  addThemeDecor(slide, pptx, theme, "closing");
  addChrome(slide, pptx, theme, index, total);

  addText(slide, "END OF PRESENTATION", {
    x: 3.25,
    y: 1.62,
    w: 6.83,
    h: 0.25,
    fontFace: FONT_LATIN,
    fontSize: 8.5,
    bold: true,
    align: "center",
    charSpacing: 2.7,
    color: theme.colors.accent,
  });
  addText(slide, "谢谢观看", {
    x: 2.15,
    y: 2.05,
    w: 9.03,
    h: 1.15,
    fontSize: 52,
    bold: true,
    align: "center",
    color: theme.colors.text,
  });
  addText(slide, deck.subtitle || "让每一次表达，都更清晰有力。", {
    x: 3.05,
    y: 3.45,
    w: 7.23,
    h: 0.55,
    fontSize: 15,
    align: "center",
    color: theme.colors.muted,
  });
  addLine(slide, pptx, 5.92, 4.52, 1.5, theme.colors.accent, 3, 0);
  addText(slide, deck.presenter || "STARDECK", {
    x: 4.15,
    y: 5.25,
    w: 5.03,
    h: 0.3,
    fontFace: FONT_LATIN,
    fontSize: 10,
    bold: true,
    align: "center",
    charSpacing: 2,
    color: theme.colors.muted,
  });

  return slide;
}

export async function exportDeckToPptx(deck) {
  const theme = THEME_MAP[deck.themeId] || THEME_MAP.aurora;
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = deck.presenter || "星演 PPT Studio";
  pptx.company = deck.presenter || "星演 PPT Studio";
  pptx.subject = deck.subtitle || "多风格演示文稿";
  pptx.title = deck.title;
  pptx.lang = "zh-CN";
  deck.slides.forEach((slideModel, index) => {
    if (slideModel.type === "cover") {
      addCoverSlide(pptx, deck, slideModel, theme, index, deck.slides.length);
    } else if (slideModel.type === "content") {
      addContentSlide(pptx, deck, slideModel, theme, index, deck.slides.length);
    } else if (slideModel.type === "summary") {
      addSummarySlide(pptx, deck, slideModel, theme, index, deck.slides.length);
    } else if (slideModel.type === "closing") {
      addClosingSlide(pptx, deck, slideModel, theme, index, deck.slides.length);
    }
  });

  await pptx.writeFile({ fileName: safeFileName(deck.title), compression: true });
}

export const exportInternals = {
  safeFileName,
  fitContain,
};
