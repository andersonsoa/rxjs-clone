/**
 *
 * @param {String} event
 * @param {TouchEvent} touchEvent
 * @returns {MouseEvent}
 */
export function touchToMouse(event, touchEvent) {
  const [touch] = touchEvent.touches.length
    ? touchEvent.touches
    : touchEvent.changedTouches;

  return new MouseEvent(event, {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
}

/**
 *
 * @param {MouseEvent} event
 * @param {HTMLElement} element
 */
export function getMousePosition(event, element) {
  const rect = element.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

/**
 *
 * @param {Number} ms
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @typedef {{x: number, y: number}} Point
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} coordinates
 * @param {Point} coordinates.from
 * @param {Point} coordinates.to
 */
export function drawLine(ctx, { from, to }) {
  ctx.beginPath();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}
