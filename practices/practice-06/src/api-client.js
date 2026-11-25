export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(baseUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("baseUrl должен быть абсолютным http- или https-адресом.");
  }
  if (url.search || url.hash) {
    throw new TypeError("baseUrl не должен содержать query-параметры или hash.");
  }
  if (typeof path !== "string" || !path.trim()) {
    throw new TypeError("path должен быть непустой строкой.");
  }

  let base = url.toString();
  if (base.endsWith("/") && path.startsWith("/")) {
    base = base.slice(0, -1);
  } else if (!base.endsWith("/") && !path.startsWith("/")) {
    base += "/";
  }

  const result = new URL(base + path);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    result.searchParams.append(key, String(value));
  }

  return result.toString();
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 3000,
} = {}) {
  if (!baseUrl) throw new TypeError("baseUrl обязателен");
  const url = new URL(baseUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new TypeError("baseUrl должен быть http/https");
  if (url.search || url.hash) throw new TypeError("baseUrl не должен содержать query или hash");
  if (typeof fetchFn !== "function") throw new TypeError("fetchFn должен быть функцией");
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError("timeoutMs должен быть положительным целым числом");

  const ALLOWED_METHODS = new Set(["GET", "POST", "PATCH", "DELETE"]);

  return {
    async requestJson(path, { method = "GET", query, body, signal, timeoutMs: reqTimeoutMs } = {}) {
      const reqMethod = String(method).toUpperCase();
      if (!ALLOWED_METHODS.has(reqMethod)) {
        throw new TypeError(`Метод ${reqMethod} не поддерживается.`);
      }
      if (reqMethod === "GET" && body !== undefined) {
        throw new TypeError("GET-запрос не может содержать тело (body).");
      }

      const requestUrl = buildUrl(baseUrl, path, query);
      const finalTimeout = reqTimeoutMs !== undefined ? reqTimeoutMs : timeoutMs;
      
      const timeoutSignal = AbortSignal.timeout(finalTimeout);
      const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

      const headers = { Accept: "application/json" };
      let reqBody = undefined;

      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        reqBody = JSON.stringify(body);
      }

      let response;
      try {
        response = await fetchFn(requestUrl, {
          method: reqMethod,
          headers,
          body: reqBody,
          signal: combinedSignal,
        });
      } catch (error) {
        if (combinedSignal.aborted) {
          if (signal?.aborted) {
            throw new ApiError("Запрос отменён.", { kind: "aborted", url: requestUrl, cause: error });
          }
          throw new ApiError("Превышено время ожидания запроса.", { kind: "timeout", url: requestUrl, cause: error });
        }
        throw new ApiError("Сетевая ошибка.", { kind: "network", url: requestUrl, cause: error });
      }

      if (!(response instanceof Response)) {
        throw new ApiError("Ожидался объект Response.", { kind: "invalid-response", url: requestUrl });
      }

      if (!response.ok) {
        let code = null;
        let details = null;
        let message = `HTTP ошибка ${response.status}`;
        try {
          const text = await response.text();
          if (text) {
            const payload = JSON.parse(text);
            if (payload && payload.error) {
              code = payload.error.code || null;
              details = payload.error.details || null;
              if (payload.error.message) message = payload.error.message;
            }
          }
        } catch {}
        throw new ApiError(message, { kind: "http", status: response.status, code, details, url: requestUrl });
      }

      if (response.status === 204) return null;

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        throw new ApiError("Сервер вернул не JSON.", { kind: "invalid-response", url: requestUrl });
      }

      try {
        return await response.json();
      } catch (error) {
        throw new ApiError("Не удалось разобрать JSON.", { kind: "invalid-response", url: requestUrl, cause: error });
      }
    }
  };
}