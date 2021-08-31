interface IStickyPair {
  element: HTMLElement;
  container: HTMLElement;
}

interface IStickyOptions {
  offsetTop: number;
  offsetBottom: number;
}

interface IStickyPairWithOptions extends IStickyPair {
  options: IStickyOptions;
  elementTop: number;
  mutationObserver: MutationObserver | null;
  resizeObserver: ResizeObserver | null;
}

const store: {
  stickyPair: IStickyPairWithOptions[];
} = {
  stickyPair: [],
};

const update = (pair: IStickyPairWithOptions) => {
  const containerRect = pair.container.getBoundingClientRect();
  const elementRect = pair.element.getBoundingClientRect();

  if (containerRect.top + pair.elementTop < pair.options.offsetTop) {
    const top = Math.abs(
      containerRect.top + pair.elementTop - pair.options.offsetTop,
    );

    const maxOffset =
      containerRect.height -
      elementRect.height -
      pair.elementTop -
      pair.options.offsetBottom;

    const offset = Math.min(top, maxOffset);

    pair.element.style.setProperty("top", `${offset}px`);
  } else {
    pair.element.style.removeProperty("top");
  }
};

const create = (
  pair: IStickyPair,
  options: IStickyOptions = {
    offsetTop: 0,
    offsetBottom: 0,
  },
) => {
  if (store.stickyPair.some((p) => p.element === pair.element) === false) {
    const containerRect = pair.container.getBoundingClientRect();
    const elementRect = pair.element.getBoundingClientRect();

    const pairWithOptions: IStickyPairWithOptions = {
      ...pair,
      options,
      elementTop: elementRect.top - containerRect.top,
      mutationObserver: null,
      resizeObserver: null,
    };

    store.stickyPair.push(pairWithOptions);

    pairWithOptions.mutationObserver = new MutationObserver(() => {
      update(pairWithOptions);
    });

    pairWithOptions.mutationObserver.observe(pairWithOptions.container, {
      childList: true,
      subtree: true,
    });

    pair.element.style.setProperty("position", "relative");

    update(pairWithOptions);

    return pair;
  }

  return null;
};

const destroy = (pair: IStickyPair) => {
  const found = store.stickyPair.find((p) => p.element === pair.element);

  if (found) {
    found.mutationObserver?.disconnect();
    found.element.style.removeProperty("position");
    found.element.style.removeProperty("top");
    store.stickyPair = store.stickyPair.filter(
      (p) => p.element !== found.element,
    );
  }
};

const updateHandler = () => {
  store.stickyPair.forEach(update);
};

window.addEventListener("scroll", updateHandler);
window.addEventListener("resize", updateHandler);

export const sticky = {
  create,
  destroy,
};
