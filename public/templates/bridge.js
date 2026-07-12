(() => {
  const params = new URLSearchParams(window.location.search);
  const skinId = params.get("skin") || "";
  const SKINS = {
    graphite: `
      :root {
        --ink: #151817;
        --ink-deep: #0e1110;
        --ink-soft: #222720;
        --taupe: #93a08e;
        --taupe-soft: rgba(147, 160, 142, 0.26);
        --gold: #caff3d;
        --gold-soft: rgba(202, 255, 61, 0.2);
        --silver: #eef9ed;
        --silver-soft: rgba(238, 249, 237, 0.76);
        --sage: #52f2b6;
        --sage-soft: rgba(82, 242, 182, 0.2);
        --card: rgba(23, 28, 25, 0.9);
        --card-strong: rgba(16, 20, 18, 0.96);
        --hairline: rgba(202, 255, 61, 0.14);
      }
      body {
        background:
          radial-gradient(860px 560px at 12% 8%, rgba(202, 255, 61, 0.14), transparent 58%),
          radial-gradient(820px 540px at 88% 20%, rgba(82, 242, 182, 0.14), transparent 62%),
          linear-gradient(135deg, #0e1110 0%, #151817 48%, #20251f 100%);
      }
      .scene::before {
        background:
          linear-gradient(90deg, rgba(202, 255, 61, 0.07) 1px, transparent 1px) 0 0 / 72px 72px,
          linear-gradient(0deg, rgba(82, 242, 182, 0.06) 1px, transparent 1px) 0 0 / 72px 72px,
          repeating-linear-gradient(135deg, transparent 0 14px, rgba(202, 255, 61, 0.035) 14px 15px, transparent 15px 28px);
      }
      h1::before { color: #caff3d; }
      .label, .audience span { color: #52f2b6; }
      .section-head .index, .display-ribbon, .icon {
        background: linear-gradient(135deg, #caff3d, #52f2b6);
      }
      .mini.cons h2 { color: #e9ff76; }
    `,
    titanium: `
      :root {
        --ink: #18212a;
        --ink-deep: #101820;
        --ink-soft: #25313b;
        --taupe: #8fa4b8;
        --taupe-soft: rgba(143, 164, 184, 0.24);
        --gold: #9fd5ff;
        --gold-soft: rgba(159, 213, 255, 0.2);
        --silver: #edf6ff;
        --silver-soft: rgba(237, 246, 255, 0.76);
        --sage: #c7d2dc;
        --sage-soft: rgba(199, 210, 220, 0.22);
        --card: rgba(20, 29, 38, 0.88);
        --card-strong: rgba(16, 24, 32, 0.96);
        --hairline: rgba(159, 213, 255, 0.15);
      }
      body {
        background:
          radial-gradient(900px 540px at 13% 9%, rgba(159, 213, 255, 0.18), transparent 58%),
          radial-gradient(760px 520px at 86% 20%, rgba(199, 210, 220, 0.16), transparent 62%),
          linear-gradient(135deg, #111821 0%, #18212a 48%, #26313a 100%);
      }
      h1 { color: #f5fbff; }
      h1::before { color: #9fd5ff; }
      .title-wrap .line::after { background: linear-gradient(90deg, #c7d2dc, #9fd5ff); }
      .label, .audience span { color: #b8e1ff; }
      .section-head .index, .display-ribbon, .icon {
        background: linear-gradient(135deg, #eef7ff, #9fd5ff);
      }
      .mini.pros h2 { color: #d8f0ff; }
      .mini.cons h2 { color: #a9cdf0; }
    `,
    ember: `
      :root {
        --ink: #211312;
        --ink-deep: #160c0b;
        --ink-soft: #321a16;
        --taupe: #b58f78;
        --taupe-soft: rgba(181, 143, 120, 0.26);
        --gold: #ffb23f;
        --gold-soft: rgba(255, 178, 63, 0.22);
        --silver: #fff2e4;
        --silver-soft: rgba(255, 242, 228, 0.76);
        --sage: #ff5f4a;
        --sage-soft: rgba(255, 95, 74, 0.2);
        --card: rgba(41, 22, 18, 0.9);
        --card-strong: rgba(30, 14, 12, 0.96);
        --hairline: rgba(255, 178, 63, 0.15);
      }
      body {
        background:
          radial-gradient(900px 540px at 12% 9%, rgba(255, 178, 63, 0.18), transparent 58%),
          radial-gradient(820px 540px at 88% 24%, rgba(255, 95, 74, 0.18), transparent 62%),
          linear-gradient(135deg, #160c0b 0%, #211312 48%, #321a16 100%);
      }
      h1::before { color: #ffb23f; }
      .title-wrap .line::after { background: linear-gradient(90deg, #ff5f4a, #ffb23f); }
      .label, .audience span { color: #ff9f6c; }
      .section-head .index, .display-ribbon, .icon {
        background: linear-gradient(135deg, #ffb23f, #ff5f4a);
      }
      .mini.pros h2 { color: #ffcb78; }
      .mini.cons h2 { color: #ff744f; }
    `,
    olive: `
      :root {
        --ink: #1b2218;
        --ink-deep: #11170f;
        --ink-soft: #28311f;
        --taupe: #a4a36d;
        --taupe-soft: rgba(164, 163, 109, 0.28);
        --gold: #d2c35b;
        --gold-soft: rgba(210, 195, 91, 0.2);
        --silver: #f0edd3;
        --silver-soft: rgba(240, 237, 211, 0.76);
        --sage: #8bb96b;
        --sage-soft: rgba(139, 185, 107, 0.22);
        --card: rgba(27, 34, 24, 0.9);
        --card-strong: rgba(17, 23, 15, 0.96);
        --hairline: rgba(210, 195, 91, 0.15);
      }
      body {
        background:
          radial-gradient(840px 540px at 12% 10%, rgba(210, 195, 91, 0.16), transparent 58%),
          radial-gradient(840px 540px at 88% 22%, rgba(139, 185, 107, 0.16), transparent 62%),
          linear-gradient(135deg, #11170f 0%, #1b2218 48%, #28311f 100%);
      }
      h1::before { color: #d2c35b; }
      .title-wrap .line::after { background: linear-gradient(90deg, #8bb96b, #d2c35b); }
      .label, .audience span { color: #9fc881; }
      .section-head .index, .display-ribbon, .icon {
        background: linear-gradient(135deg, #d2c35b, #8bb96b);
      }
      .mini.cons h2 { color: #d8c96a; }
    `,
    ice: `
      :root {
        --bg-0: #031728;
        --bg-1: #07304b;
        --bg-2: #0a5474;
        --cyan: #a7f6ff;
        --cyan-soft: rgba(167, 246, 255, 0.4);
        --blue: #c9dcff;
        --green: #7affea;
        --yellow: #f6f7c5;
        --text: #f2fdff;
        --text-soft: rgba(242, 253, 255, 0.9);
        --panel-bg: rgba(10, 68, 98, 0.42);
        --panel-bg-deep: rgba(5, 36, 60, 0.52);
      }
      body {
        background:
          radial-gradient(1100px 680px at 0% 85%, rgba(167, 246, 255, 0.18), transparent 58%),
          radial-gradient(900px 600px at 92% 18%, rgba(201, 220, 255, 0.17), transparent 62%),
          linear-gradient(135deg, var(--bg-0), var(--bg-1) 45%, var(--bg-2));
      }
      h1 { background-image: linear-gradient(90deg, #ffffff, #a7f6ff, #c9dcff, #ffffff); }
      .panel { border-color: rgba(167, 246, 255, 0.7); }
      .mini.pros h2 { color: #a7f6ff; }
      .mini.cons h2 { color: #f6f7c5; }
    `,
  };

  const skinCss = SKINS[skinId] || "";
  const templateId = skinCss ? skinId : window.STARDECK_TEMPLATE_ID || "product-review";
  document.documentElement.dataset.stardeckSkin = templateId;
  if (skinCss) {
    const style = document.createElement("style");
    style.id = "stardeck-skin";
    style.textContent = skinCss;
    document.head.appendChild(style);
  }

  const image = document.getElementById("displayProductImage");
  const imageBackground = document.getElementById("displayMediaBg");
  const imageMedia = document.querySelector(".display-media");
  const defaultImage = image?.getAttribute("src") || "";

  const setValue = (id, value) => {
    const input = document.getElementById(id);
    if (input && typeof value === "string") input.value = value;
  };

  const normalizeLines = (text) => String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•›]\s*/, "").trim())
    .filter(Boolean);

  const parseSpecs = (text) => normalizeLines(text)
    .map((line) => {
      const separator = line.indexOf("|");
      if (separator < 1) return null;
      const label = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      return label && value ? { label, value } : null;
    })
    .filter(Boolean);

  const setImage = (src) => {
    const finalSrc = src || defaultImage;
    if (!image || !imageBackground) return;
    if (!finalSrc) {
      image.removeAttribute("src");
      image.style.display = "none";
      imageBackground.style.backgroundImage = "";
      imageMedia?.classList.add("is-empty");
      return;
    }
    imageBackground.style.backgroundImage = `url("${String(finalSrc).replace(/"/g, '\\"')}")`;
    image.setAttribute("src", finalSrc);
    image.style.display = "";
    imageMedia?.classList.remove("is-empty");
  };

  const setAudience = (value) => {
    const audience = document.querySelector(".audience");
    if (!audience || typeof value !== "string") return;
    const label = document.createElement("span");
    label.textContent = audience.closest(".footer-ribbon") ? "最终结论：" : "适用人群：";
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

  const setPrice = (value) => {
    document.querySelectorAll(".price-value").forEach((node) => {
      node.textContent = String(value || "").trim() || "价格待填写";
    });
  };

  const setComment = (value) => {
    document.querySelectorAll(".comment-note").forEach((node) => {
      node.textContent = String(value || "").trim() || "产品链接置顶在评论区";
    });
  };

  const renderSpecs = (value) => {
    const specs = parseSpecs(value);
    document.querySelectorAll(".spec-list").forEach((list) => {
      list.replaceChildren(...specs.map(({ label, value }) => {
        const li = document.createElement("li");
        const labelSpan = document.createElement("span");
        labelSpan.className = "label";
        labelSpan.textContent = `${label}：`;
        const valueSpan = document.createElement("span");
        valueSpan.className = "value";
        valueSpan.textContent = value;
        li.append(labelSpan, valueSpan);
        if (label === "响应时间" || label === "AI系统") {
          const icon = document.createElement("span");
          icon.className = "icon";
          icon.textContent = label === "响应时间" ? "⚡" : "AI";
          li.appendChild(icon);
        }
        if (label === "屏幕刷新率" || label === "屏幕硬件") {
          const icon = document.createElement("span");
          icon.className = "icon";
          icon.textContent = label === "屏幕刷新率" ? "⟳" : "眼";
          li.appendChild(icon);
        }
        return li;
      }));
    });

    document.querySelectorAll("[data-spec-label]").forEach((node) => {
      const match = specs.find((spec) => spec.label === node.dataset.specLabel);
      node.textContent = match ? match.value : "";
    });
  };

  const renderList = (selector, value) => {
    const lines = normalizeLines(value);
    document.querySelectorAll(selector).forEach((list) => {
      list.replaceChildren(...lines.map((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        return li;
      }));
    });
  };

  const apply = (payload = {}) => {
    setValue("neoCfgTitle", payload.title);
    setValue("neoCfgPrice", payload.price);
    setValue("neoCfgSpecs", payload.specs);
    setValue("neoCfgAudience", payload.audience);
    setValue("neoCfgPros", payload.pros);
    setValue("neoCfgCons", payload.cons);
    setValue("neoCfgComment", payload.comment);
    setImage(payload.imageData || "");
    document.getElementById("neoCfgTitle")?.dispatchEvent(new Event("input", { bubbles: true }));
    setTitle(payload.title);
    setBrand(payload.brand);
    setPrice(payload.price);
    renderSpecs(payload.specs);
    setAudience(payload.audience);
    renderList(".mini.pros ul", payload.pros);
    renderList(".mini.cons ul", payload.cons);
    setComment(payload.comment);
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
