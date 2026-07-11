import pptxgen from "pptxgenjs";
import {
  DEFAULT_REVIEW,
  parseProductConfig,
  parseSpecLines,
  validateReview,
} from "./product-model.js";

const STORAGE_KEY = "product-review-studio-v2";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

const STYLES = {
  gold: {
    name: "暖金工业风 · 模板3",
    src: "/templates/gold.html",
  },
  neon: {
    name: "蓝青霓虹风 · UG25HF",
    src: "/templates/neon.html",
  },
};

const state = {
  ...DEFAULT_REVIEW,
  imageData: "",
  imageName: "",
  imageWidth: 0,
  imageHeight: 0,
};

const elements = {
  styleGrid: document.querySelector("#styleGrid"),
  title: document.querySelector("#titleInput"),
  brand: document.querySelector("#brandInput"),
  specs: document.querySelector("#specsInput"),
  audience: document.querySelector("#audienceInput"),
  pros: document.querySelector("#prosInput"),
  cons: document.querySelector("#consInput"),
  specCount: document.querySelector("#specCount"),
  importInput: document.querySelector("#importInput"),
  importButton: document.querySelector("#importButton"),
  imageInput: document.querySelector("#imageInput"),
  imageDropzone: document.querySelector("#imageDropzone"),
  imageTitle: document.querySelector("#imageTitle"),
  imageMeta: document.querySelector("#imageMeta"),
  removeImage: document.querySelector("#removeImageButton"),
  frame: document.querySelector("#templateFrame"),
  previewFrame: document.querySelector("#previewFrame"),
  frameLoading: document.querySelector("#frameLoading"),
  activeStyleName: document.querySelector("#activeStyleName"),
  pngButton: document.querySelector("#pngButton"),
  pptxButton: document.querySelector("#pptxButton"),
  pptxLabel: document.querySelector("#pptxLabel"),
  saveStatus: document.querySelector("#saveStatus"),
  toast: document.querySelector("#toast"),
};

let frameReady = false;
let saveTimer = 0;
let toastTimer = 0;

function getTemplatePayload() {
  return {
    title: state.title,
    brand: state.brand,
    specs: state.specs,
    audience: state.audience,
    pros: state.pros,
    cons: state.cons,
    imageData: state.imageData,
  };
}

function safeFileName(value) {
  const result = String(value || "商品测评")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .slice(0, 60);
  return result || "商品测评";
}

function showToast(message, type = "info") {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("is-error", type === "error");
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3600);
}

function persistState() {
  window.clearTimeout(saveTimer);
  elements.saveStatus.textContent = "正在保存…";
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        styleId: state.styleId,
        title: state.title,
        brand: state.brand,
        specs: state.specs,
        audience: state.audience,
        pros: state.pros,
        cons: state.cons,
      }));
      elements.saveStatus.textContent = "文字内容已保存在本机";
    } catch {
      elements.saveStatus.textContent = "当前浏览器无法保存草稿";
    }
  }, 360);
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return;
    if (saved.styleId && STYLES[saved.styleId]) state.styleId = saved.styleId;
    ["title", "brand", "specs", "audience", "pros", "cons"].forEach((key) => {
      if (typeof saved[key] === "string") state[key] = saved[key];
    });
  } catch {
    // A malformed local draft should never block the original template.
  }
}

function syncInputs() {
  elements.title.value = state.title;
  elements.brand.value = state.brand;
  elements.specs.value = state.specs;
  elements.audience.value = state.audience;
  elements.pros.value = state.pros;
  elements.cons.value = state.cons;
  updateSpecCount();
  updateImageUi();
  updateStyleUi();
}

function updateSpecCount() {
  const count = parseSpecLines(state.specs).length;
  elements.specCount.textContent = `${count} 项`;
  elements.specCount.classList.toggle("is-over-limit", count > 10);
}

function updateImageUi() {
  const hasImage = Boolean(state.imageData);
  elements.removeImage.classList.toggle("is-hidden", !hasImage);
  elements.imageTitle.textContent = hasImage ? state.imageName : "上传产品图片";
  elements.imageMeta.textContent = hasImage
    ? `${state.imageWidth} × ${state.imageHeight} · 当前母版已替换`
    : "PNG、JPG 或 WebP，最大 10 MB";
}

function updateStyleUi() {
  const style = STYLES[state.styleId] || STYLES.gold;
  elements.activeStyleName.textContent = style.name;
  elements.styleGrid.querySelectorAll("[data-style]").forEach((button) => {
    const selected = button.dataset.style === state.styleId;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function applyToFrame() {
  const frameWindow = elements.frame.contentWindow;
  if (!frameWindow) return;
  const bridge = frameWindow.StarDeckBridge;
  if (bridge?.apply) {
    bridge.apply(getTemplatePayload());
    return;
  }
  frameWindow.postMessage({ type: "STARDECK_APPLY", payload: getTemplatePayload() }, location.origin);
}

function markFrameReady() {
  frameReady = true;
  applyToFrame();
  elements.frame.classList.add("is-ready");
  elements.frameLoading.classList.add("is-hidden");
}

function loadStyle(styleId, { persist = true } = {}) {
  if (!STYLES[styleId]) return;
  state.styleId = styleId;
  frameReady = false;
  elements.frame.classList.remove("is-ready");
  elements.frameLoading.classList.remove("is-hidden");
  updateStyleUi();

  const target = new URL(STYLES[styleId].src, location.href).href;
  if (elements.frame.src !== target) {
    elements.frame.src = STYLES[styleId].src;
  } else {
    elements.frame.addEventListener("load", markFrameReady, { once: true });
    elements.frame.contentWindow?.location.reload();
  }
  if (persist) persistState();
}

function resizePreview() {
  const contentWidth = elements.previewFrame.clientWidth;
  if (!contentWidth) return;
  const scale = contentWidth / SLIDE_WIDTH;
  const computed = getComputedStyle(elements.previewFrame);
  const borderHeight = Number.parseFloat(computed.borderTopWidth) + Number.parseFloat(computed.borderBottomWidth);
  elements.frame.style.transform = `scale(${scale})`;
  elements.previewFrame.style.height = `${SLIDE_HEIGHT * scale + borderHeight}px`;
}

function updateTextField(key, value) {
  state[key] = value;
  if (key === "specs") updateSpecCount();
  applyToFrame();
  persistState();
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
  const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (!file || !allowedTypes.has(file.type)) throw new Error("请选择 PNG、JPG 或 WebP 图片");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("图片超过 10 MB，请压缩后再上传");

  const original = await readFileAsDataUrl(file);
  const image = await loadImage(original);
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  let dataUrl = original;

  if (!width || !height || width * height > 32_000_000) {
    throw new Error("图片像素尺寸过大，请压缩到 3200 万像素以内");
  }

  if (file.type === "image/webp" || Math.max(width, height) > 2600) {
    const scale = Math.min(1, 2400 / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("浏览器无法处理这张图片");
    context.drawImage(image, 0, 0, width, height);
    dataUrl = canvas.toDataURL("image/png");
  }

  return { dataUrl, width, height, name: file.name };
}

async function handleImageFile(file) {
  if (!file) return;
  try {
    elements.imageTitle.textContent = "正在处理图片…";
    const image = await normalizeImage(file);
    Object.assign(state, {
      imageData: image.dataUrl,
      imageName: image.name,
      imageWidth: image.width,
      imageHeight: image.height,
    });
    updateImageUi();
    applyToFrame();
    showToast("产品图已替换，PNG 与 PPTX 会使用同一画面。");
  } catch (error) {
    console.error(error);
    showToast(error.message || "图片处理失败，请换一张重试。", "error");
    updateImageUi();
  } finally {
    elements.imageInput.value = "";
  }
}

async function importConfig(file) {
  if (!file) return;
  try {
    const imported = parseProductConfig(await file.text(), state);
    Object.assign(state, imported);
    syncInputs();
    applyToFrame();
    persistState();
    showToast(`已按原配置格式导入「${file.name}」。`);
  } catch (error) {
    console.error(error);
    showToast(error.message || "TXT 导入失败，请检查配置格式。", "error");
  } finally {
    elements.importInput.value = "";
  }
}

function waitForBridge(timeout = 12000) {
  const started = performance.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const bridge = elements.frame.contentWindow?.StarDeckBridge;
      if (frameReady && bridge?.capture) {
        resolve(bridge);
        return;
      }
      if (performance.now() - started > timeout) {
        reject(new Error("原版母版加载超时，请刷新页面后重试"));
        return;
      }
      window.setTimeout(check, 80);
    };
    check();
  });
}

async function captureActiveTemplate() {
  const errors = validateReview(state);
  if (errors.length) throw new Error(errors[0]);
  const bridge = await waitForBridge();
  bridge.apply(getTemplatePayload());
  return bridge.capture({ scale: 1 });
}

function triggerDownload(href, fileName) {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function withBusy(button, label, busyText, task) {
  button.disabled = true;
  button.classList.add("is-loading");
  const previous = label.textContent;
  label.textContent = busyText;
  try {
    await task();
  } catch (error) {
    console.error(error);
    showToast(error.message || "生成失败，请稍后重试。", "error");
  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    label.textContent = previous;
  }
}

async function downloadPng() {
  const original = elements.pngButton.textContent;
  elements.pngButton.disabled = true;
  elements.pngButton.textContent = "正在生成…";
  try {
    const dataUrl = await captureActiveTemplate();
    triggerDownload(dataUrl, `${safeFileName(state.title)}-${state.styleId}.png`);
    showToast("1920 × 1080 PNG 已生成，与当前预览为同一母版。");
  } catch (error) {
    console.error(error);
    showToast(error.message || "PNG 生成失败，请稍后重试。", "error");
  } finally {
    elements.pngButton.disabled = false;
    elements.pngButton.textContent = original;
  }
}

async function downloadPptx() {
  await withBusy(elements.pptxButton, elements.pptxLabel, "正在生成…", async () => {
    const dataUrl = await captureActiveTemplate();
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "好物测评 PPT 生成器";
    pptx.subject = STYLES[state.styleId].name;
    pptx.title = state.title;
    pptx.company = "StarDeck";
    pptx.lang = "zh-CN";
    pptx.theme = {
      headFontFace: "Microsoft YaHei",
      bodyFontFace: "Microsoft YaHei",
      lang: "zh-CN",
    };
    const slide = pptx.addSlide();
    slide.background = { color: state.styleId === "neon" ? "041423" : "393534" };
    slide.addImage({ data: dataUrl, x: 0, y: 0, w: 13.333333, h: 7.5 });
    await pptx.writeFile({
      fileName: `${safeFileName(state.title)}-${state.styleId}.pptx`,
      compression: true,
    });
    showToast("同款 PPTX 已生成：单页 16:9，画面与原版预览一致。");
  });
}

elements.title.addEventListener("input", (event) => updateTextField("title", event.target.value));
elements.brand.addEventListener("input", (event) => updateTextField("brand", event.target.value));
elements.specs.addEventListener("input", (event) => updateTextField("specs", event.target.value));
elements.audience.addEventListener("input", (event) => updateTextField("audience", event.target.value));
elements.pros.addEventListener("input", (event) => updateTextField("pros", event.target.value));
elements.cons.addEventListener("input", (event) => updateTextField("cons", event.target.value));

elements.styleGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-style]");
  if (!button || button.dataset.style === state.styleId) return;
  loadStyle(button.dataset.style);
});

elements.importButton.addEventListener("click", () => elements.importInput.click());
elements.importInput.addEventListener("change", (event) => importConfig(event.target.files?.[0]));
elements.imageDropzone.addEventListener("click", () => elements.imageInput.click());
elements.imageInput.addEventListener("change", (event) => handleImageFile(event.target.files?.[0]));
elements.removeImage.addEventListener("click", () => {
  Object.assign(state, { imageData: "", imageName: "", imageWidth: 0, imageHeight: 0 });
  updateImageUi();
  applyToFrame();
  showToast("已恢复当前原版母版的示例图。");
});
elements.pngButton.addEventListener("click", downloadPng);
elements.pptxButton.addEventListener("click", downloadPptx);

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

window.addEventListener("message", (event) => {
  if (event.origin !== location.origin || event.source !== elements.frame.contentWindow) return;
  if (event.data?.type === "STARDECK_TEMPLATE_READY") markFrameReady();
});

elements.frame.addEventListener("load", () => {
  if (elements.frame.contentWindow?.StarDeckBridge) markFrameReady();
});

new ResizeObserver(resizePreview).observe(elements.previewFrame);
window.addEventListener("resize", resizePreview);
document.querySelector(".brand")?.addEventListener("click", (event) => event.preventDefault());

restoreState();
syncInputs();
loadStyle(state.styleId, { persist: false });
requestAnimationFrame(resizePreview);
