/**
 * Canvas 2D 초기화 및 DPR 대응 리사이즈
 * @param {HTMLCanvasElement} canvas
 */
export function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  let displayWidth = 0;
  let displayHeight = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    displayWidth = width;
    displayHeight = height;
  }

  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("scroll", resize);
  resize();

  return {
    canvas,
    ctx,
    getDisplaySize: () => ({ width: displayWidth, height: displayHeight }),
    getDpr: () => window.devicePixelRatio || 1,
    resize,
  };
}
