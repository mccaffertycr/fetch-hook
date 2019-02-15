import { useLayoutEffect, useMemo, useReducer, useRef } from 'react';

const useForceUpdate = () => useReducer(state => !state, false)[1];

const createFetchError = res => {
  const err = new Error(`${res.status} ${res.statusText}`);
  err.name = `FetchError`;
  return err;
};

const createPromiseResolver = () => {
  let resolve;
  const promise = new Promise(r => {
    resolve = r;
  });
  return { resolve, promise };
};

const defaultOptions = {};
const defaultReadBody = body => body.json();

export const useFetch = (input, options = defaultOptions) => {
  const forceUpdate = useForceUpdate();
  const error = useRef(null);
  const loading = useRef(false);
  const data = useRef(null);
  const promiseResolver = useMemo(createPromiseResolver, [input, options]);

  useLayoutEffect(() => {
    let finished = false;
    const abortController = new AbortController();
    (async () => {
      if (!input) return;
      // begin fetch
      loading.current = true;
      forceUpdate();
      const onFinish = (e, d) => {
        if (!finished) {
          finished = true;
          error.current = e;
          data.current = d;
          loading.current = false;
        }
      };
      try {
        const { readBody = defaultReadBody, ...init } = options;
        const response = await fetch(input, {
          ...init,
          signal: abortController.signal,
        });
        // check response
        if (response.ok) {
          const body = await readBody(response);
          onFinish(null, body);
        } else {
          onFinish(createFetchError(response), null);
        }
      } catch (e) {
        onFinish(e, null);
      }
      // complete fetch
      promiseResolver.resolve();
    })();
    const cleanup = () => {
      if (!finished) {
        finished = true;
        abortController.abort();
      }
      error.current = null;
      loading.current = false;
      data.current = null;
    };
    return cleanup;
  }, [input, options]);
  if (loading.current) throw promiseResolver.promise;
  return {
    error: error.current,
    data: data.current,
  };
};
