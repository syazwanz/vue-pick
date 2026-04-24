export function setupResizeObserver(
  el: HTMLElement,
  callback: () => void,
): () => void {
  if (typeof ResizeObserver === "undefined") return () => {}
  const ro = new ResizeObserver(() => callback())
  ro.observe(el)
  return () => ro.disconnect()
}
