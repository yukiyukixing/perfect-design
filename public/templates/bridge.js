(() => {
  const templateId = window.STARDECK_TEMPLATE_ID || "product-review";
  const image = document.getElementById("displayProductImage");
  const imageBackground = document.getElementById("displayMediaBg");
  const imageMedia = document.querySelector(".display-media");
  const defaultImage = image?.getAttribute("src") || "";

  const setValue = (id, value) => {
    const input = document.getElementById(id);
    if (input && typeof value === "string") input.value = value;
  };

  const setImage = (src) => {
    const finalSrc = src || defaultImage;
    if (!finalSrc || !image || !imageBackground) return;
    imageBackground.style.backgroundImage = `url("${String(finalSrc).replace(/"/g, '\\"')}")`;
    image.setAttribute("src", finalSrc);
    image.style.display = "";
    imageMedia?.classList.remove("is-empty");
  };

  const setAudience = (value) => {
    const audience = document.querySelector(".audience");
    if (!audience || typeof value !== "string") return;
    const label = document.createElement("span");
    label.textContent = "适用人群：";
    audience.replaceChildren(label, document.createTextNode(value));
  };

  const setBrand = (value) => {
    const brand = document.querySelector(".brand-pill");
    if (!brand || typeof value !== "string") return;
    const dot = brand.querySelector(".dot") || document.createElement("span");
    dot.className = "dot";
    brand.replaceChildren(dot, document.createTextNode(value.trim() || "测评账号"));
  };

  const setTitle = (value) => {
    const title = document.querySelector(".title-wrap h1");
    if (title && typeof value === "string") title.textContent = value.trim() || "请输入页面标题";
  };

  const apply = (payload = {}) => {
    setValue("neoCfgTitle", payload.title);
    setValue("neoCfgSpecs", payload.specs);
    setValue("neoCfgAudience", payload.audience);
    setValue("neoCfgPros", payload.pros);
    setValue("neoCfgCons", payload.cons);
    setImage(payload.imageData || "");
    document.getElementById("neoCfgTitle")?.dispatchEvent(new Event("input", { bubbles: true }));
    setTitle(payload.title);
    setBrand(payload.brand);
    setAudience(payload.audience);
  };

  const waitForImages = async (root) => {
    const images = Array.from(root.querySelectorAll("img"));
    await Promise.all(images.map(async (img) => {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      }
      if (img.decode) await img.decode().catch(() => {});
    }));
  };

  const capture = async ({ scale = 2 } = {}) => {
    if (!window.html2canvas) throw new Error("高清导出组件尚未就绪");
    const target = document.querySelector(".scene") || document.body;
    document.documentElement.classList.add("stardeck-capturing");
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await waitForImages(target);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const canvas = await window.html2canvas(target, {
        scale,
        width: 1920,
        height: 1080,
        windowWidth: 1920,
        windowHeight: 1080,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
      });
      return canvas.toDataURL("image/png");
    } finally {
      document.documentElement.classList.remove("stardeck-capturing");
    }
  };

  window.StarDeckBridge = { apply, capture, templateId };
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.origin !== location.origin) return;
    if (event.data?.type === "STARDECK_APPLY") apply(event.data.payload);
  });
  window.parent.postMessage({ type: "STARDECK_TEMPLATE_READY", templateId }, location.origin);
})();
