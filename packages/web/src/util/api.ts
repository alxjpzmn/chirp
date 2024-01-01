export const fetcher = async (url: string) => {
  console.info(`calling ${url}`);

  return fetch(url).then((r) => r.json());
};
