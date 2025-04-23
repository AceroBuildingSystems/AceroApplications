export function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(err => {
      console.error("Clipboard write failed", err);
    });
  }
  