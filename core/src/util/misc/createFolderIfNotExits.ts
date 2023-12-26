import { existsSync, mkdirSync } from "fs";
const createFolderIfNotExists = (folderPath: string) => {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath);
  } else {
    console.log(
      `Folder '${folderPath}' already exists, skipping folder creation.`,
    );
  }
};

export default createFolderIfNotExists;
