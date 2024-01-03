import path from "path";

const getBasePath = () => {
  return path.resolve(Bun.env.DATA_DIR ?? ".");
};

export default getBasePath;
