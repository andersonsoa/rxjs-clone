import { mouseEvents } from "./constants.js";
import {
  merge,
  fromEvent,
  log,
  map,
  subscribe,
  switchMap,
  takeUntil,
} from "./operatos.js";
import { drawLine, getMousePosition, sleep, touchToMouse } from "./utils.js";

const btn = document.getElementById("btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const resetCanvas = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

resetCanvas();

const store = {
  db: [],
  get() {
    return this.db;
  },
  set(item) {
    this.db.unshift(item);
  },
  clear() {
    this.db.length = 0;
  },
};

fromEvent(mouseEvents.click, btn).pipeTo(
  subscribe(async (e) => {
    ctx.beginPath();
    ctx.strokeStyle = "#fff";

    for (const { from, to } of store.get()) {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.lineWidth = 2;
      ctx.stroke();
      await sleep(5);
    }
    store.clear();
    resetCanvas();
  }),
);

merge([
  fromEvent(mouseEvents.down, canvas),
  fromEvent(mouseEvents.touchstart, canvas).pipeThrough(
    map((obj) => touchToMouse(mouseEvents.down, obj)),
  ),
])
  .pipeThrough(
    switchMap((e) => {
      return merge([
        fromEvent(mouseEvents.move, canvas),
        fromEvent(mouseEvents.touchmove, canvas).pipeThrough(
          map((obj) => touchToMouse(mouseEvents.move, obj)),
        ),
      ]).pipeThrough(
        takeUntil(
          merge([
            fromEvent(mouseEvents.up, canvas),
            fromEvent(mouseEvents.leave, canvas),
            fromEvent(mouseEvents.touchend, canvas).pipeThrough(
              map((obj) => touchToMouse(mouseEvents.up, obj)),
            ),
          ]),
        ),
      );
    }),
  )
  .pipeThrough(
    map(function ([mouseDown, mouseMove]) {
      this._lastPosition = this._lastPosition ?? mouseDown;
      const [from, to] = [this._lastPosition, mouseMove].map((item) =>
        getMousePosition(item, canvas),
      );
      this._lastPosition = mouseMove.type === mouseEvents.up ? null : mouseMove;
      return { from, to };
    }),
  )
  .pipeTo(
    subscribe(({ from, to }) => {
      store.set({ from, to });
      drawLine(ctx, { from, to });
    }),
  );
