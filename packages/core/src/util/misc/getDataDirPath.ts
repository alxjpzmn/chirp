import path from "path";

const getDataDirPath = () => {
  return path.resolve(Bun.env.DATA_DIR ?? ".");
};

export default getDataDirPath;
