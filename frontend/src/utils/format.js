// Date formatting, string truncation, and clipboard helper utilities

// Formats an ISO timestamp into localized date/time
export function formatFullDate(isoString) {
  if (!isoString) return "Never";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return isoString;
  }
}

// Converts timestamp into relative time string
export function timeAgo(isoString) {
  if (!isoString) return "Never";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 10) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;

    return `${Math.floor(diffMonths / 12)}y ago`;
  } catch {
    return "Recently";
  }
}

// Truncates long URLs for clean display
export function truncateUrl(url, maxLength = 45) {
  if (!url) return "";
  const clean = url.replace(/^https?:\/\//i, "");
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength - 3) + "...";
}

// Copies text to system clipboard
export async function copyToClipboard(text) {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard failed:", err);
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
}

// Converts an SVG string into a downloadable PNG file
export function downloadSvgAsPng(svgHtml, filename = "qr-code.png", dimension = 600) {
  const canvas = document.createElement("canvas");
  canvas.width = dimension;
  canvas.height = dimension;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  const svgBlob = new Blob([svgHtml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dimension, dimension);
    ctx.drawImage(img, 0, 0, dimension, dimension);
    URL.revokeObjectURL(url);

    const a = document.createElement("a");
    a.download = filename;
    a.href = canvas.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  img.src = url;
}
