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
  observer: MutationObserver | null;
}

const store: {
  stickyPair: IStickyPairWithOptions[];
} = {
  stickyPair: [],
};

const update = (pair: IStickyPairWithOptions) => {
  const containerRect = pair.container.getBoundingClientRect();

  if (containerRect.top < pair.options.offsetTop) {
    const top = Math.min(
      Math.abs(containerRect.top - pair.options.offsetTop),
      containerRect.height -
        pair.element.clientHeight -
        pair.options.offsetBottom,
    );

    pair.element.style.setProperty("top", `${top}px`);
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
    const pairWithOptions: IStickyPairWithOptions = {
      ...pair,
      options,
      observer: null,
    };
    store.stickyPair.push(pairWithOptions);

    pairWithOptions.observer = new MutationObserver(() => {
      update(pairWithOptions);
    });

    pairWithOptions.observer.observe(pairWithOptions.container, {
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
    found.observer?.disconnect();
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
