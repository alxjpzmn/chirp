interface AuthConfig {
  serverPassword: string;
}

const getAuthConfig = (): AuthConfig => {
  return { serverPassword: Bun.env.PASSWORD ?? "" };
};

export default getAuthConfig;
