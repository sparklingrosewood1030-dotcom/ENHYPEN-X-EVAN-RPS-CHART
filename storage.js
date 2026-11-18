// Local persistence and portable JSON backup helpers.
window.ChartStorage = (() => {
  const KEY = "enhypen-evan-chart-v1";
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch { return null; }
  };
  const write = (value) => localStorage.setItem(KEY, JSON.stringify(value));
  const download = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  return { read, write, download, key: KEY };
})();
