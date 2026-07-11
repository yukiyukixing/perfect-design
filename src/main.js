import { THEMES, THEME_MAP, applyVariables, cssThemeVariables } from "./themes.js";
import { exportDeckToPptx } from "./ppt-export.js";
import { buildSlides, convertLegacyText, parseOutline } from "./deck-model.js";

const STORAGE_KEY = "stardeck-ppt-studio-v1";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const EXAMPLE = {
  title: "UG25HF：500Hz 电竞显示器值不值得买？",
  subtitle: "从核心参数、真实体验到购买建议，一次讲清这台毫秒级上分利器。",
  presenter: "咕嘎咕嘎研究所",
  outline: `# 产品定位
- 24.1 英寸 Fast TN 面板，主打极致刷新率与响应速度
- 面向重度 FPS 玩家和追求竞技优势的用户
- 核心卖点不是“全能”，而是把速度做到极致

# 核心参数
- 1920 × 1080 分辨率，原生 500Hz 刷新率
- 0.5ms GTG 响应时间，350nit 典型亮度
- 支持 Adaptive-Sync，降低高速画面撕裂
- 机身净重约 5.2kg，配备多向人体工学支架

# 实测亮点
- 高频动态画面更连贯，压枪和快速转身的轨迹更清晰
- 输入反馈直接，适合 CS2、无畏契约等高帧率竞技游戏
- 菜单与快捷键逻辑清楚，调节效率高

# 需要注意
- 1080P 更偏竞技取向，不适合追求高分辨率细腻度的人群
- TN 面板的可视角度与色彩表现不是主要优势
- 想发挥 500Hz，需要整机稳定输出足够高的帧率

# 购买建议
- 已有高性能主机、主要玩 FPS：优先考虑
- 兼顾 3A 与内容创作：建议对比高刷 IPS 或 OLED
- 先确认桌面距离、显卡性能和接口带宽，再决定是否入手`,
  closing: true,
  themeId: "aurora",
};

const state = {
  ...EXAMPLE,
  selectedIndex: 0,
  coverImage: null,
};

const elements = {
  title: document.querySelector("#titleInput"),
  subtitle: document.querySelector("#subtitleInput"),
  presenter: document.querySelector("#presenterInput"),
  outline: document.querySelector("#outlineInput"),
  closing: document.querySelector("#closingInput"),
  outlineMeta: document.querySelector("#outlineMeta"),
  stage: document.querySelector("#slideStage"),
  thumbs: document.querySelector("#thumbStrip"),
  currentPage: document.querySelector("#currentPage"),
  totalPages: document.querySelector("#totalPages"),
  currentThemeName: document.querySelector("#currentThemeName"),
  deckSummary: document.querySelector("#deckSummary"),
  previous: document.querySelector("#previousButton"),
  next: document.querySelector("#nextButton"),
  themeGrid: document.querySelector("#themeGrid"),
  example: document.querySelector("#exampleButton"),
  importButton: document.querySelector("#importButton"),
  importInput: document.querySelector("#importInput"),
  imageInput: document.querySelector("#imageInput"),
  imageDropzone: document.querySelector("#imageDropzone"),
  imageDropTitle: document.querySelector("#imageDropTitle"),
  imageDropMeta: document.querySelector("#imageDropMeta"),
  removeImage: document.querySelector("#removeImageButton"),
  exportButton: document.querySelector("#exportButton"),
  exportLabel: document.querySelector("#exportLabel"),
  saveStatus: document.querySelector("#saveStatus"),
  toast: document.querySelector("#toast"),
};

let saveTimer = null;
let toastTimer = null;

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function getDeck() {
  const sections = parseOutline(state.outline);
  return {
    title: state.title.trim() || "未命名演示文稿",
    subtitle: state.subtitle.trim() || "用清晰的结构，让观点被看见。",
    presenter: state.presenter.trim(),
    themeId: state.themeId,
    coverImage: state.coverImage,
    sections,
    slides: buildSlides(sections, state.closing),
  };
}

function formatPage(value) {
  return String(value).padStart(2, "0");
}

function applyThemeToSlide(element, theme) {
  element.dataset.theme = theme.id;
  applyVariables(element, cssThemeVariables(theme));
}

function createChrome(index, total) {
  const chrome = createElement("div", "slide-chrome");
  chrome.append(
    createElement("span", "", "STARDECK / PRESENTATION"),
    createElement("span", "chrome-index", `${formatPage(index + 1)} / ${formatPage(total)}`),
  );
  return chrome;
}

function createCoverSlide(deck, theme, index, total) {
  const slide = createElement("article", "deck-slide slide-cover");
  applyThemeToSlide(slide, theme);
  slide.append(createChrome(index, total));

  const layout = createElement("div", `cover-layout${deck.coverImage ? " has-image" : ""}`);
  const copy = createElement("div", "cover-copy");
  copy.append(createElement("span", "slide-kicker", "IDEA / STORY / IMPACT"));
  copy.append(createElement("h2", "", deck.title));
  copy.append(createElement("p", "", deck.subtitle));

  const meta = createElement("div", "cover-meta");
  meta.append(createElement("span", "", deck.presenter || "STARDECK"));
  meta.append(createElement("i"));
  meta.append(createElement("span", "", String(new Date().getFullYear())));
  copy.append(meta);

  const visual = createElement("div", "cover-visual");
  if (deck.coverImage) {
    const image = createElement("img");
    image.src = deck.coverImage.dataUrl;
    image.alt = `${deck.title} 封面图`;
    visual.append(image);
  } else {
    const abstract = createElement("div", "abstract-visual");
    abstract.append(createElement("span", "orbit"));
    abstract.append(createElement("strong", "", "01"));
    abstract.append(createElement("small", "", "PRESENT WITH CLARITY"));
    visual.append(abstract);
  }

  layout.append(copy, visual);
  slide.append(layout);
  return slide;
}

function createContentSlide(slideModel, theme, index, total) {
  const slide = createElement("article", "deck-slide slide-content");
  applyThemeToSlide(slide, theme);
  slide.append(createChrome(index, total));

  const layout = createElement("div", "content-layout");
  const marker = createElement("aside", "section-marker");
  marker.append(createElement("strong", "", formatPage(slideModel.sectionIndex + 1)));
  marker.append(createElement("i"));
  marker.append(createElement("small", "", "SECTION"));

  const main = createElement("div", "content-main");
  const header = createElement("header", "content-header");
  const titleBlock = createElement("div");
  titleBlock.append(createElement("span", "", "KEY MESSAGE"));
  titleBlock.append(createElement("h2", "", slideModel.title));
  header.append(titleBlock);
  header.append(createElement("small", "", `${formatPage(slideModel.chunkIndex + 1)} / ${formatPage(slideModel.chunkTotal)}`));

  const list = createElement("div", "bullet-list");
  slideModel.bullets.forEach((bullet, bulletIndex) => {
    const item = createElement("div", "bullet-item");
    item.append(createElement("span", "", formatPage(bulletIndex + 1)));
    item.append(createElement("p", "", bullet));
    list.append(item);
  });
  main.append(header, list);
  layout.append(marker, main);
  slide.append(layout);
  return slide;
}

function createSummarySlide(slideModel, theme, index, total) {
  const slide = createElement("article", "deck-slide slide-summary");
  applyThemeToSlide(slide, theme);
  slide.append(createChrome(index, total));

  const layout = createElement("div", "summary-layout");
  const head = createElement("header", "summary-head");
  const titleBlock = createElement("div");
  titleBlock.append(createElement("span", "", "RECAP / TAKEAWAYS"));
  titleBlock.append(createElement("h2", "", "核心回顾"));
  head.append(titleBlock, createElement("strong", "", formatPage(slideModel.items.length)));

  const grid = createElement("div", "summary-grid");
  slideModel.items.forEach((item, itemIndex) => {
    const card = createElement("div", "summary-card");
    card.append(createElement("span", "", formatPage(itemIndex + 1)));
    card.append(createElement("h3", "", item.title));
    card.append(createElement("p", "", item.text));
    grid.append(card);
  });
  layout.append(head, grid);
  slide.append(layout);
  return slide;
}

function createClosingSlide(deck, theme, index, total) {
  const slide = createElement("article", "deck-slide slide-closing");
  applyThemeToSlide(slide, theme);
  slide.append(createChrome(index, total));

  const layout = createElement("div", "closing-layout");
  const content = createElement("div", "closing-content");
  content.append(createElement("span", "", "END OF PRESENTATION"));
  content.append(createElement("h2", "", "谢谢观看"));
  content.append(createElement("p", "", deck.subtitle || "让每一次表达，都更清晰有力。"));
  content.append(createElement("div", "closing-rule"));
  content.append(createElement("div", "closing-meta", deck.presenter || "STARDECK"));
  layout.append(content);
  slide.append(layout);
  return slide;
}

function createSlideNode(slideModel, deck, theme, index, total) {
  if (slideModel.type === "cover") return createCoverSlide(deck, theme, index, total);
  if (slideModel.type === "content") return createContentSlide(slideModel, theme, index, total);
  if (slideModel.type === "summary") return createSummarySlide(slideModel, theme, index, total);
  return createClosingSlide(deck, theme, index, total);
}

function createThumbnail(slideModel, theme, index) {
  const button = createElement("button", `thumb-button${index === state.selectedIndex ? " is-selected" : ""}`);
  button.type = "button";
  button.dataset.index = String(index);
  button.setAttribute("role", "option");
  button.setAttribute("aria-selected", String(index === state.selectedIndex));
  button.setAttribute("aria-label", `第 ${index + 1} 页：${slideModel.title}`);

  const canvas = createElement("span", "thumb-canvas");
  canvas.style.setProperty("--thumb-bg", `#${theme.colors.bg}`);
  canvas.style.setProperty("--thumb-text", `#${theme.colors.text}`);
  canvas.style.setProperty("--thumb-accent", `#${theme.colors.accent}`);
  canvas.append(createElement("i"));

  const caption = createElement("span");
  caption.append(createElement("b", "", formatPage(index + 1)));
  caption.append(createElement("em", "", slideModel.title));
  button.append(canvas, caption);
  return button;
}

function renderThemeGrid() {
  const fragment = document.createDocumentFragment();
  THEMES.forEach((theme) => {
    const button = createElement("button", `theme-card${theme.id === state.themeId ? " is-selected" : ""}`);
    button.type = "button";
    button.dataset.themeId = theme.id;
    button.setAttribute("role", "listitem");
    button.setAttribute("aria-pressed", String(theme.id === state.themeId));
    button.title = theme.description;

    const swatch = createElement("span", "theme-swatch");
    swatch.style.setProperty("--swatch-bg", `#${theme.colors.bg}`);
    swatch.style.setProperty("--swatch-text", `#${theme.colors.text}`);
    swatch.style.setProperty("--swatch-accent", `#${theme.colors.accent}`);
    swatch.style.setProperty("--swatch-surface", `#${theme.colors.surface}`);
    swatch.append(createElement("i"), createElement("b"));

    const copy = createElement("span", "theme-card-copy");
    copy.append(createElement("strong", "", theme.name));
    copy.append(createElement("small", "", theme.tag));
    button.append(swatch, copy);
    fragment.append(button);
  });
  elements.themeGrid.replaceChildren(fragment);
}

function render({ scrollThumb = false } = {}) {
  const deck = getDeck();
  const theme = THEME_MAP[state.themeId] || THEMES[0];
  state.selectedIndex = Math.max(0, Math.min(state.selectedIndex, deck.slides.length - 1));

  elements.stage.replaceChildren(
    createSlideNode(deck.slides[state.selectedIndex], deck, theme, state.selectedIndex, deck.slides.length),
  );

  const fragment = document.createDocumentFragment();
  deck.slides.forEach((slide, index) => fragment.append(createThumbnail(slide, theme, index)));
  elements.thumbs.replaceChildren(fragment);

  elements.currentPage.textContent = formatPage(state.selectedIndex + 1);
  elements.totalPages.textContent = formatPage(deck.slides.length);
  elements.currentThemeName.textContent = theme.name;
  elements.deckSummary.textContent = `共 ${deck.slides.length} 页`;
  elements.outlineMeta.textContent = `${deck.sections.length} 个章节 · ${deck.slides.length} 页`;
  elements.previous.disabled = state.selectedIndex === 0;
  elements.next.disabled = state.selectedIndex === deck.slides.length - 1;
  elements.removeImage.classList.toggle("is-hidden", !state.coverImage);
  elements.imageDropTitle.textContent = state.coverImage?.name || "上传一张封面图";
  elements.imageDropMeta.textContent = state.coverImage
    ? `${state.coverImage.width} × ${state.coverImage.height} · 已加入封面`
    : "PNG、JPG 或 WebP，最大 10 MB";

  renderThemeGrid();

  if (scrollThumb) {
    requestAnimationFrame(() => {
      elements.thumbs.querySelector(".thumb-button.is-selected")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
  }
}

function syncInputs() {
  elements.title.value = state.title;
  elements.subtitle.value = state.subtitle;
  elements.presenter.value = state.presenter;
  elements.outline.value = state.outline;
  elements.closing.checked = state.closing;
}

function showToast(message, type = "info") {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("is-error", type === "error");
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3200);
}

function persistState() {
  window.clearTimeout(saveTimer);
  elements.saveStatus.textContent = "正在保存…";
  saveTimer = window.setTimeout(() => {
    try {
      const payload = {
        title: state.title,
        subtitle: state.subtitle,
        presenter: state.presenter,
        outline: state.outline,
        closing: state.closing,
        themeId: state.themeId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      elements.saveStatus.textContent = "更改已保存在本机";
    } catch {
      elements.saveStatus.textContent = "当前浏览器无法保存草稿";
    }
  }, 420);
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return;
    ["title", "subtitle", "presenter", "outline"].forEach((key) => {
      if (typeof saved[key] === "string") state[key] = saved[key];
    });
    if (typeof saved.closing === "boolean") state.closing = saved.closing;
    if (saved.themeId && THEME_MAP[saved.themeId]) state.themeId = saved.themeId;
  } catch {
    // Ignore malformed local drafts and use the safe example.
  }
}

function updateState(key, value) {
  state[key] = value;
  state.selectedIndex = Math.min(state.selectedIndex, getDeck().slides.length - 1);
  render();
  persistState();
}

function goToPage(index) {
  const total = getDeck().slides.length;
  const nextIndex = Math.max(0, Math.min(index, total - 1));
  if (nextIndex === state.selectedIndex) return;
  state.selectedIndex = nextIndex;
  render({ scrollThumb: true });
}

async function importFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    let imported;
    if (file.name.toLowerCase().endsWith(".json")) {
      const parsed = JSON.parse(text);
      imported = {
        title: typeof parsed.title === "string" ? parsed.title : state.title,
        subtitle: typeof parsed.subtitle === "string" ? parsed.subtitle : state.subtitle,
        presenter: typeof parsed.presenter === "string" ? parsed.presenter : state.presenter,
        outline: typeof parsed.outline === "string" ? parsed.outline : state.outline,
        closing: typeof parsed.closing === "boolean" ? parsed.closing : state.closing,
        themeId: THEME_MAP[parsed.themeId] ? parsed.themeId : state.themeId,
      };
    } else {
      imported = convertLegacyText(text, state);
    }

    Object.assign(state, imported, { selectedIndex: 0 });
    syncInputs();
    render();
    persistState();
    showToast(`已导入「${file.name}」，并生成 ${getDeck().slides.length} 页预览。`);
  } catch (error) {
    console.error(error);
    showToast("导入失败：请确认文件是 UTF-8 文本、Markdown 或有效 JSON。", "error");
  } finally {
    elements.importInput.value = "";
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片格式无法识别"));
    image.src = dataUrl;
  });
}

async function normalizeImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("请选择 PNG、JPG 或 WebP 图片");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("图片超过 10 MB，请先压缩后再上传");

  const original = await readFileAsDataUrl(file);
  const image = await loadImage(original);
  const needsConversion = file.type === "image/webp" || Math.max(image.naturalWidth, image.naturalHeight) > 2600;
  let dataUrl = original;
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (needsConversion) {
    const scale = Math.min(1, 2400 / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);
    dataUrl = canvas.toDataURL("image/png");
  }

  return { dataUrl, width, height, name: file.name };
}

async function handleImageFile(file) {
  if (!file) return;
  try {
    elements.imageDropTitle.textContent = "正在处理图片…";
    state.coverImage = await normalizeImage(file);
    state.selectedIndex = 0;
    render();
    showToast("封面图已加入，导出的 PPTX 也会包含这张图片。");
  } catch (error) {
    console.error(error);
    showToast(error.message || "图片处理失败，请换一张重试。", "error");
    render();
  } finally {
    elements.imageInput.value = "";
  }
}

async function handleExport() {
  const deck = getDeck();
  if (!deck.title.trim()) {
    showToast("请先填写演示主标题。", "error");
    elements.title.focus();
    return;
  }

  elements.exportButton.disabled = true;
  elements.exportButton.classList.add("is-loading");
  elements.exportLabel.textContent = "正在生成…";
  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await exportDeckToPptx(deck);
    showToast(`PPTX 已生成：${deck.slides.length} 页，文字与图形可继续编辑。`);
  } catch (error) {
    console.error(error);
    showToast("PPTX 生成失败，请稍后重试或更换封面图片。", "error");
  } finally {
    elements.exportButton.disabled = false;
    elements.exportButton.classList.remove("is-loading");
    elements.exportLabel.textContent = "导出 PPTX";
  }
}

elements.title.addEventListener("input", (event) => updateState("title", event.target.value));
elements.subtitle.addEventListener("input", (event) => updateState("subtitle", event.target.value));
elements.presenter.addEventListener("input", (event) => updateState("presenter", event.target.value));
elements.outline.addEventListener("input", (event) => updateState("outline", event.target.value));
elements.closing.addEventListener("change", (event) => updateState("closing", event.target.checked));

elements.themeGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theme-id]");
  if (!button || !THEME_MAP[button.dataset.themeId]) return;
  state.themeId = button.dataset.themeId;
  render();
  persistState();
});

elements.thumbs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-index]");
  if (!button) return;
  goToPage(Number(button.dataset.index));
});

elements.previous.addEventListener("click", () => goToPage(state.selectedIndex - 1));
elements.next.addEventListener("click", () => goToPage(state.selectedIndex + 1));

elements.example.addEventListener("click", () => {
  Object.assign(state, EXAMPLE, { selectedIndex: 0, coverImage: null });
  syncInputs();
  render();
  persistState();
  showToast("示例内容已填入，可以直接切换风格或导出。 ");
});

elements.importButton.addEventListener("click", () => elements.importInput.click());
elements.importInput.addEventListener("change", (event) => importFile(event.target.files?.[0]));
elements.imageDropzone.addEventListener("click", () => elements.imageInput.click());
elements.imageInput.addEventListener("change", (event) => handleImageFile(event.target.files?.[0]));
elements.removeImage.addEventListener("click", () => {
  state.coverImage = null;
  state.selectedIndex = 0;
  render();
  showToast("封面图已移除。 ");
});
elements.exportButton.addEventListener("click", handleExport);

["dragenter", "dragover"].forEach((eventName) => {
  elements.imageDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.imageDropzone.classList.add("is-dragging");
  });
});
["dragleave", "drop"].forEach((eventName) => {
  elements.imageDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.imageDropzone.classList.remove("is-dragging");
  });
});
elements.imageDropzone.addEventListener("drop", (event) => handleImageFile(event.dataTransfer?.files?.[0]));

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) return;
  if (event.key === "ArrowLeft") goToPage(state.selectedIndex - 1);
  if (event.key === "ArrowRight") goToPage(state.selectedIndex + 1);
});

document.querySelector(".brand")?.addEventListener("click", (event) => event.preventDefault());

restoreState();
syncInputs();
render();
