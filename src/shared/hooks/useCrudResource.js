import { useCallback, useEffect, useState } from "react";

const toError = (error, fallbackMessage) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
};

const sameId = (firstId, secondId) => {
  return String(firstId) === String(secondId);
};

export const useCrudResource = ({
  service,
  messages,
  initialData = [],
  autoFetch = true,
}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await service.getAll();
      const nextData = Array.isArray(result) ? result : [];

      setData(nextData);

      return nextData;
    } catch (error) {
      const normalizedError = toError(error, messages.fetch);

      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, [messages.fetch, service]);

  const create = useCallback(
    async (payload) => {
      setError(null);

      try {
        const item = await service.create(payload);

        if (item !== null) {
          setData((current) => [...current, item]);
        }

        return item;
      } catch (error) {
        const normalizedError = toError(error, messages.create);

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [messages.create, service],
  );

  const update = useCallback(
    async (id, payload) => {
      setError(null);

      try {
        const item = await service.update(id, payload);

        if (item !== null) {
          setData((current) =>
            current.map((currentItem) =>
              sameId(currentItem.id, id) ? item : currentItem,
            ),
          );
        }

        return item;
      } catch (error) {
        const normalizedError = toError(error, messages.update);

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [messages.update, service],
  );

  const remove = useCallback(
    async (id) => {
      setError(null);

      try {
        await service.remove(id);

        setData((current) => current.filter((item) => !sameId(item.id, id)));

        return true;
      } catch (error) {
        const normalizedError = toError(error, messages.delete);

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [messages.delete, service],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return {
    data,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    refresh: fetchAll,
  };
};

useCrudResource.displayName = "useCrudResource";

export default useCrudResource;
