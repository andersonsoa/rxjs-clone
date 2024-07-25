/**
 * fromEvent
 * @param {String} event
 * @param {HTMLElement} element
 * @returns {ReadableStream}
 */
export function fromEvent(event, element) {
  let _callback;
  return new ReadableStream({
    start(controller) {
      _callback = (e) => controller.enqueue(e);

      element.addEventListener(event, _callback);
    },
    cancel() {
      element.removeEventListener(event, _callback);
    },
  });
}

/**
 * map
 * @param {Function} fn
 * @returns {TransformStream}
 */
export function map(fn) {
  return new TransformStream({
    transform(chunk, controller) {
      const result = fn.bind(fn)(chunk);
      controller.enqueue(result);
    },
  });
}

/**
 * @typedef {ReadableStream | TransformStream} Stream
 * @param {Stream[]} streams
 * @returns {ReadableStream}
 */
export function merge(streams) {
  return new ReadableStream({
    async start(controller) {
      for (const stream of streams) {
        const reader = (stream.readable || stream).getReader();

        async function read() {
          const { value, done } = await reader.read();
          if (done) return;
          if (controller.desiredSize === 0) return;

          controller.enqueue(value);
          return read();
        }

        read();
      }
    },
  });
}

/**
 * @typedef {function(): ReadableStream | TransformStream} StreamFunction
 *
 * @param {StreamFunction} fn
 * @param {object} options
 * @param {boolean} options.parwise
 *
 * @returns {TransformStream}
 */
export function switchMap(fn, options = { parwise: true }) {
  return new TransformStream({
    transform(chunk, controller) {
      const stream = fn.bind(fn)(chunk);

      const reader = (stream.readable || stream).getReader();
      async function read() {
        const { value, done } = await reader.read();
        if (done) return;

        const result = options.parwise ? [chunk, value] : [value];
        controller.enqueue(result);

        return read();
      }
      read();
    },
  });
}

/**
 *
 * @param {ReadableStream | TransformStream} stream
 * @returns {TransformStream}
 */
export function takeUntil(stream) {
  const readAndTerminate = async (stream, controller) => {
    const reader = (stream.readable || stream).getReader();
    const { value } = await reader.read();
    controller.enqueue(value);
    controller.terminate();
  };
  return new TransformStream({
    start(controller) {
      readAndTerminate(stream, controller);
    },
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
  });
}

/**
 *
 * @returns {WritableStream}
 */
export function log() {
  return new WritableStream({
    write(chunk) {
      console.log("LOG:", chunk);
    },
  });
}

/**
 * @param {Function} cb
 * @returns {WritableStream}
 */
export function subscribe(cb) {
  return new WritableStream({
    write(chunk) {
      cb(chunk);
    },
  });
}
