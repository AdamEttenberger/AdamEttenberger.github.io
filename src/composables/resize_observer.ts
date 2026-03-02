export default function useResizeObserver(callback: ResizeObserverCallback) {
  const observer = new ResizeObserver(callback);

  function observe(target: Element) {
    observer.observe(target);
  }

  function unobserve(target: Element) {
    observer.unobserve(target);
  }

  function stop() {
    observer.disconnect();
  }

  return {
    observe,
    unobserve,
    stop,
  };
}