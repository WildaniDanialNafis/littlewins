const normalizeKey = (key) => {
  return String(key ?? "").trim();
};

export const createMutationCoordinator = () => {
  const queues = new Map();
  const inFlight = new Map();

  const run = ({ conflictKey, operationKey, task }) => {
    if (typeof task !== "function") {
      return Promise.reject(
        new TypeError("Mutation task harus berupa function."),
      );
    }

    const normalizedConflictKey = normalizeKey(conflictKey);

    const normalizedOperationKey = normalizeKey(operationKey);

    if (!normalizedConflictKey) {
      return Promise.resolve().then(task);
    }

    if (normalizedOperationKey) {
      const existingPromise = inFlight.get(normalizedOperationKey);

      if (existingPromise) {
        return existingPromise;
      }
    }

    const previousPromise = queues.get(normalizedConflictKey);

    const promise = (
      previousPromise
        ? previousPromise.catch(() => undefined)
        : Promise.resolve()
    ).then(task);

    queues.set(normalizedConflictKey, promise);

    if (normalizedOperationKey) {
      inFlight.set(normalizedOperationKey, promise);
    }

    const cleanup = () => {
      if (queues.get(normalizedConflictKey) === promise) {
        queues.delete(normalizedConflictKey);
      }

      if (
        normalizedOperationKey &&
        inFlight.get(normalizedOperationKey) === promise
      ) {
        inFlight.delete(normalizedOperationKey);
      }
    };

    void promise.then(cleanup, cleanup);

    return promise;
  };

  const clear = () => {
    queues.clear();
    inFlight.clear();
  };

  return {
    run,
    clear,
    reset: clear,
  };
};

export default createMutationCoordinator;
