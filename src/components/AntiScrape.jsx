import { useEffect } from "react";

export default function AntiScrape() {
  useEffect(() => {
    // Basic anti-scrape protection
    // Remember: This only stops casual users. It does not stop automated tools or headless browsers,
    // which is why it doesn't harm Google SEO.

    // 1. Disable Right Click (context menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+P)
    const handleKeyDown = (e) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Ctrl+Shift+I (DevTools) or Ctrl+Shift+J or Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key.toUpperCase() === "U") {
        e.preventDefault();
      }
      // Ctrl+P (Print)
      if (e.ctrlKey && e.key.toUpperCase() === "P") {
        e.preventDefault();
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key.toUpperCase() === "S") {
        e.preventDefault();
      }
    };

    // 3. Disable Text Selection & Dragging Globally
    // We add a class to body to disable text selection, 
    // but we have to be careful not to break input fields.
    const style = document.createElement('style');
    style.innerHTML = `
      body:not(input):not(textarea) {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      img {
        -webkit-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      document.head.removeChild(style);
    };
  }, []);

  return null; // This component doesn't render anything
}
