// Axios
interface AxiosRequestConfig<D = any> {
  url?: string;
  method?: Method;
  baseURL?: string;
  transformRequest?: AxiosRequestTransformer | AxiosRequestTransformer[];
  transformResponse?: AxiosResponseTransformer | AxiosResponseTransformer[];
  headers?: AxiosRequestHeaders;
  params?: any;
  paramsSerializer?: (params: any) => string;
  data?: D;
  timeout?: number;
  timeoutErrorMessage?: string;
  withCredentials?: boolean;
  adapter?: AxiosAdapter;
  auth?: AxiosBasicCredentials;
  responseType?: ResponseType;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  maxContentLength?: number;
  validateStatus?: ((status: number) => boolean) | null;
  maxBodyLength?: number;
  maxRedirects?: number;
  socketPath?: string | null;
  httpAgent?: any;
  httpsAgent?: any;
  proxy?: AxiosProxyConfig | false;
  cancelToken?: CancelToken;
  decompress?: boolean;
  transitional?: TransitionalOptions;
  signal?: AbortSignal;
  insecureHTTPParser?: boolean;
}

interface Axios {
  constructor(config?: AxiosRequestConfig);
  defaults: AxiosDefaults;
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
  getUri(config?: AxiosRequestConfig): string;
  request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
  get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
}

declare var axios: Axios;

// Audio
declare var Audio: {
  new(src?: string): HTMLAudioElement;
};

// fetch
interface RequestInit {
  // whatwg/fetch standard options
  body?: BodyInit | undefined;
  headers?: HeadersInit | undefined;
  method?: string | undefined;
  redirect?: RequestRedirect | undefined;
  signal?: AbortSignal | null | undefined;

  // node-fetch extensions
  agent?: RequestOptions['agent'] | ((parsedUrl: URL) => RequestOptions['agent']); // =null http.Agent instance, allows custom proxy, certificate etc.
  compress?: boolean | undefined; // =true support gzip/deflate content encoding. false to disable
  follow?: number | undefined; // =20 maximum redirect count. 0 to not follow redirect
  size?: number | undefined; // =0 maximum response body size in bytes. 0 to disable
  timeout?: number | undefined; // =0 req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)

  // node-fetch does not support mode, cache or credentials options
}

declare function fetch(
  url: RequestInfo,
  init?: RequestInit
): Promise<Response>;

// console
declare var console: {
  log(message?: any): void,
  error(message?: any): void,
  clear(): void,
}

declare var setTimeout: (callback: () => void, ms: number) => number;
declare var clearTimeout: (timeoutId: number) => void;
