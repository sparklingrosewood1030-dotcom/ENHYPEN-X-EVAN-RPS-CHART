(() => {
  const members = window.CHART_MEMBERS;
  const options = window.PREFERENCE_OPTIONS;
  const labels = window.PAIRING_LABELS || {};
  const $ = (id) => document.getElementById(id);
  const state = { cells: {}, colors: {}, photos: {}, selected: null };
  let undoStack = [], redoStack = [];
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const cellKey = (row, col) => `${row}|${col}`;
  const member = (id) => members.find(m => m.id === id);
  const labelFor = (row, col) => {
    const custom = labels[cellKey(row, col)];
    if (custom?.hangul || custom?.romanization) return custom;
    const a = member(row), b = member(col);
    return { hangul: `${a.name} × ${b.name}`, romanization: `${a.name} × ${b.name}` };
  };
  const option = (id) => options.find(o => o.id === id);
  const colorFor = (id) => state.colors[id] || option(id)?.color || "#fff";

  function snapshot() {
    return { cells: clone(state.cells), colors: clone(state.colors), photos: clone(state.photos) };
  }
  function saveHistory() {
    undoStack.push(snapshot());
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
  }
  function restore(s) {
    state.cells = s.cells; state.colors = s.colors; state.photos = s.photos;
    persist(); renderAll();
  }
  function persist() {
    try {
      ChartStorage.write(snapshot());
      $("saveStatus").textContent = "Saved locally";
    } catch {
      $("saveStatus").textContent = "Storage full — export a backup";
    }
  }
  function updateHistoryButtons() {
    $("undoBtn").disabled = !undoStack.length;
    $("redoBtn").disabled = !redoStack.length;
  }
  function choose(row, col) {
    state.selected = cellKey(row, col);
    const label = labelFor(row, col);
    $("selectedPair").innerHTML = `<strong>${escapeHtml(label.hangul)}</strong><span>${escapeHtml(label.romanization)}</span><small>${escapeHtml(member(row).name)} × ${escapeHtml(member(col).name)}</small>`;
    $("preferenceSelect").disabled = false;
    $("preferenceSelect").value = state.cells[state.selected] || "";
    document.querySelectorAll(".chart-cell").forEach(c => c.classList.toggle("selected", c.dataset.key === state.selected));
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function renderTable() {
    const head = $("columnHeaders");
    head.innerHTML = '<th class="corner" aria-label="Pairing direction"></th>';
    members.forEach(m => {
      const th = document.createElement("th");
      th.innerHTML = `<span>${escapeHtml(m.name)}</span>`;
      head.appendChild(th);
    });
    const body = $("chartBody"); body.innerHTML = "";
    members.forEach(row => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.innerHTML = `<span>${escapeHtml(row.name)}</span>`;
      tr.appendChild(th);
      members.forEach(col => {
        const key = cellKey(row.id, col.id), td = document.createElement("td");
        const b = document.createElement("button");
        b.type = "button"; b.className = "chart-cell"; b.dataset.key = key;
        const label = labelFor(row.id, col.id);
        b.innerHTML = `<span class="hangul">${escapeHtml(label.hangul)}</span><span class="roman">${escapeHtml(label.romanization)}</span>`;
        b.style.backgroundColor = state.cells[key] ? colorFor(state.cells[key]) : "#fff";
        b.setAttribute("aria-label", `${row.name} by ${col.name}: ${state.cells[key] ? option(state.cells[key]).label : "Unselected"}`);
        b.addEventListener("click", () => {
          choose(row.id, col.id);
          $("dialogPairTitle").textContent = label.hangul;
          $("dialogPairSub").textContent = `${label.romanization} · ${row.name} × ${col.name}`;
          $("dialogPreference").value = state.cells[key] || "";
          $("cellDialog").showModal();
        });
        td.appendChild(b); tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    if (state.selected) {
      const [r,c] = state.selected.split("|"); choose(r,c);
    }
  }
  function renderLegend() {
    $("legend").innerHTML = "";
    options.forEach(o => {
      const item = document.createElement("div"); item.className = "legend-item";
      const swatch = document.createElement("span"); swatch.className = "swatch";
      swatch.style.backgroundColor = colorFor(o.id);
      const text = document.createElement("span"); text.textContent = o.label;
      item.append(swatch, text); $("legend").appendChild(item);
    });
  }
  function renderColors() {
    $("colorSettings").innerHTML = "";
    options.forEach(o => {
      const row = document.createElement("label"); row.className = "color-row";
      row.innerHTML = `<span>${escapeHtml(o.label)}</span><input type="color" value="${colorFor(o.id)}" aria-label="${o.label} color">`;
      row.querySelector("input").addEventListener("input", e => {
        saveHistory(); state.colors[o.id] = e.target.value; persist(); renderTable(); renderLegend();
      });
      $("colorSettings").appendChild(row);
    });
  }
  function renderPhotos() {
    $("photoSettings").innerHTML = "";
    members.forEach(m => {
      const row = document.createElement("label"); row.className = "photo-row";
      const preview = document.createElement("span"); preview.className = "photo-preview";
      if (state.photos[m.id]) preview.style.backgroundImage = `url(${state.photos[m.id]})`;
      else preview.textContent = m.name.slice(0,1);
      const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
      input.addEventListener("change", () => {
        const file = input.files[0]; if (!file) return;
        if (!file.type.startsWith("image/")) return alert("Please choose an image file.");
        if (file.size > 2_500_000) return alert("Please choose an image under 2.5 MB to keep local storage manageable.");
        const reader = new FileReader();
        reader.onload = () => { saveHistory(); state.photos[m.id] = reader.result; persist(); renderPhotos(); };
        reader.readAsDataURL(file);
      });
      const name = document.createElement("span"); name.textContent = m.name;
      row.append(preview, name, input); $("photoSettings").appendChild(row);
    });
  }
  function renderAll() {
    renderTable(); renderLegend(); renderColors(); renderPhotos(); updateHistoryButtons();
  }
  function setPreference(value) {
    if (!state.selected) return;
    saveHistory();
    if (value) state.cells[state.selected] = value;
    else delete state.cells[state.selected];
    persist(); renderTable(); $("preferenceSelect").value = value;
  }
  options.forEach(o => {
    const opt = document.createElement("option"); opt.value = o.id; opt.textContent = `${o.label} — ${o.description}`;
    $("preferenceSelect").appendChild(opt.cloneNode(true));
    $("dialogPreference").appendChild(opt);
  });
  $("preferenceSelect").addEventListener("change", e => setPreference(e.target.value));
  $("applyPreferenceBtn").addEventListener("click", () => {
    setPreference($("dialogPreference").value); $("cellDialog").close();
  });
  $("undoBtn").addEventListener("click", () => {
    if (!undoStack.length) return;
    redoStack.push(snapshot()); restore(undoStack.pop()); updateHistoryButtons();
  });
  $("redoBtn").addEventListener("click", () => {
    if (!redoStack.length) return;
    undoStack.push(snapshot()); restore(redoStack.pop()); updateHistoryButtons();
  });
  $("resetBtn").addEventListener("click", () => {
    if (!confirm("Clear all pairing preferences and custom colors? Photos will be kept.")) return;
    saveHistory(); state.cells = {}; state.colors = {}; persist(); renderAll();
  });
  $("exportJsonBtn").addEventListener("click", () => {
    ChartStorage.download("enhypen-evan-chart-backup.json", JSON.stringify({
      format: "enhypen-evan-chart", version: 1, exportedAt: new Date().toISOString(), ...snapshot()
    }, null, 2), "application/json");
  });
  $("importJsonInput").addEventListener("change", async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.format !== "enhypen-evan-chart" || data.version !== 1 || !data.cells || !data.colors) throw new Error("This is not a supported chart backup.");
      if (!confirm("Import this backup? It will replace the current chart and photos.")) return;
      saveHistory(); state.cells = data.cells; state.colors = data.colors; state.photos = data.photos || {};
      persist(); renderAll();
    } catch (err) { alert(err.message || "Could not read this backup."); }
    e.target.value = "";
  });
  $("exportPngBtn").addEventListener("click", async () => {
    const table = $("preferenceTable");
    const cloneTable = table.cloneNode(true);
    cloneTable.querySelectorAll("button").forEach(b => {
      b.style.border = "0"; b.style.width = "150px"; b.style.height = "76px";
      b.style.borderRadius = "0"; b.style.boxShadow = "none";
    });
    const html = `<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;background:#fff;color:#181818;padding:24px">
      <h1 style="text-align:center;color:#900;font-size:30px">ENHYPEN × EVAN</h1>
      <h2 style="text-align:center;font-size:19px">PAIRING PREFERENCE CHART</h2>
      ${cloneTable.outerHTML}
      <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:20px">${options.map(o=>`<span style="display:flex;align-items:center;gap:6px"><i style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${colorFor(o.id)};border:1px solid #bbb"></i>${o.label}</span>`).join("")}</div>
      <p style="text-align:center;color:#777;font-size:12px;margin-top:22px">Fan-made, unofficial chart</p></div>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1250"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
    const blob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob), img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas"); canvas.width = 1500; canvas.height = 1250;
      const ctx = canvas.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0,0,1500,1250); ctx.drawImage(img,0,0);
      canvas.toBlob(png => {
        const pngUrl = URL.createObjectURL(png), a = document.createElement("a");
        a.href = pngUrl; a.download = "enhypen-evan-preference-chart.png"; a.click();
        URL.revokeObjectURL(pngUrl); URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); alert("PNG export could not render in this browser. Please use Export backup for now."); };
    img.src = url;
  });

  const existing = ChartStorage.read();
  if (existing) {
    state.cells = existing.cells || {}; state.colors = existing.colors || {}; state.photos = existing.photos || {};
  }
  renderAll();
})();
