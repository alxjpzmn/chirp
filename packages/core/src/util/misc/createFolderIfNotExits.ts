import { existsSync, mkdirSync } from "fs";
const createFolderIfNotExists = (folderPath: string) => {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  } else {
    console.info(
      `Folder '${folderPath}' already exists, skipping folder creation.`,
    );
  }
};

export default createFolderIfNotExists;
