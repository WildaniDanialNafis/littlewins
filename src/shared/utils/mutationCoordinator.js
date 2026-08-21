const normalizeKey = (key) => {
  if (key === null || key === undefined) {
    return "";
  }

  return String(key).trim();
};

const createInvalidOperationError = () => {
  const error = new Error("Mutation sudah tidak berlaku.");

  error.name = "MutationCancelledError";

  error.code = "MUTATION_CANCELLED";

  return error;
};

export const createMutationCoordinator = () => {
  const queues = new Map();

  const inFlight = new Map();

  let generation = 0;

  const run = ({ conflictKey, operationKey, task }) => {
    if (typeof task !== "function") {
      return Promise.reject(
        new TypeError("Mutation task harus berupa function."),
      );
    }

    const normalizedConflictKey = normalizeKey(conflictKey);

    const normalizedOperationKey = normalizeKey(operationKey);

    const operationGeneration = generation;

    /*
     * Same exact operation:
     * one promise only.
     */
    if (normalizedOperationKey) {
      const existing = inFlight.get(normalizedOperationKey);

      if (existing) {
        return existing.promise;
      }
    }

    /*
     * No conflict domain.
     */
    if (!normalizedConflictKey) {
      let promise;

      promise = Promise.resolve()
        .then(() => {
          if (operationGeneration !== generation) {
            throw createInvalidOperationError();
          }

          return task();
        })
        .finally(() => {
          if (normalizedOperationKey) {
            const current = inFlight.get(normalizedOperationKey);

            if (current?.promise === promise) {
              inFlight.delete(normalizedOperationKey);
            }
          }
        });

      if (normalizedOperationKey) {
        inFlight.set(normalizedOperationKey, {
          promise,
          generation: operationGeneration,
        });
      }

      return promise;
    }

    /*
     * Same report conflict domain:
     * serialize mutations.
     */
    const previousPromise = queues.get(normalizedConflictKey);

    const previous = previousPromise
      ? previousPromise.catch(() => undefined)
      : Promise.resolve();

    let promise;

    promise = previous.then(() => {
      if (operationGeneration !== generation) {
        throw createInvalidOperationError();
      }

      return task();
    });

    queues.set(normalizedConflictKey, promise);

    if (normalizedOperationKey) {
      inFlight.set(normalizedOperationKey, {
        promise,
        generation: operationGeneration,
      });
    }

    const cleanup = () => {
      if (queues.get(normalizedConflictKey) === promise) {
        queues.delete(normalizedConflictKey);
      }

      if (normalizedOperationKey) {
        const current = inFlight.get(normalizedOperationKey);

        if (current?.promise === promise) {
          inFlight.delete(normalizedOperationKey);
        }
      }
    };

    void promise.then(cleanup, cleanup);

    return promise;
  };

  const clear = () => {
    generation += 1;

    queues.clear();

    inFlight.clear();
  };

  return {
    run,
    clear,
    reset: clear,
  };
};

export const mutationCoordinator = createMutationCoordinator();

export default createMutationCoordinator;
