const getServiceUrl = (): string => {
  return `${Bun.env.SSL === "true" ? "https://" : "http://"}${Bun.env.HOST ?? "localhost"
    }${Bun.env.PORT && `:${Bun.env.PORT}`}`;
};

export default getServiceUrl;
