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

    /* ======================================================
     * EXACT OPERATION DEDUPE
     * ====================================================== */

    if (normalizedOperationKey) {
      const existing = inFlight.get(normalizedOperationKey);

      if (existing) {
        return existing.promise;
      }
    }

    /* ======================================================
     * NO CONFLICT DOMAIN
     * ====================================================== */

    if (!normalizedConflictKey) {
      const promise = Promise.resolve().then(() => {
        if (operationGeneration !== generation) {
          throw createInvalidOperationError();
        }

        return task();
      });

      if (normalizedOperationKey) {
        inFlight.set(normalizedOperationKey, {
          promise,
          generation: operationGeneration,
        });
      }

      const cleanup = () => {
        if (!normalizedOperationKey) {
          return;
        }

        const current = inFlight.get(normalizedOperationKey);

        if (current?.promise === promise) {
          inFlight.delete(normalizedOperationKey);
        }
      };

      void promise.then(cleanup, cleanup);

      return promise;
    }

    /* ======================================================
     * QUEUED OPERATION
     * ====================================================== */

    const previousPromise = queues.get(normalizedConflictKey);

    const previous = previousPromise
      ? previousPromise.catch(() => undefined)
      : Promise.resolve();

    const promise = previous.then(() => {
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

    /* ======================================================
     * CLEANUP
     * ====================================================== */

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

/*
 * Shared application-level coordinator.
 *
 * Jangan membuat coordinator baru di setiap hook.
 */
export const mutationCoordinator = createMutationCoordinator();

export default createMutationCoordinator;
