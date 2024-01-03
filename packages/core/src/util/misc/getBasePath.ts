import path from "path";

const getBasePath = () => {
  console.log(Bun.env.DATA_DIR ?? ".");
  return path.resolve(Bun.env.DATA_DIR ?? ".");
};

export default getBasePath;
