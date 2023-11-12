import { Readability, isProbablyReaderable } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { normalizeWhiteSpaces } from "normalize-text";
import { db } from "@db/init";
import { articles } from "@db/schema";

const extractArticleText = async (url: string) => {
  console.log(`getting stuff for ${url}`);

  const rawResponse = await fetch(url);

  if (rawResponse.status !== 200) {
    throw new Error(
      `Error getting input source, HTTP status code: ${rawResponse?.status}.`,
    );
  }

  const DOMWindow = new JSDOM("").window;
  const DOMPurify = createDOMPurify(DOMWindow);
  const rawhtml = await rawResponse.text();
  const sanitizedHtml = DOMPurify.sanitize(rawhtml);
  const interpretedHtml = new JSDOM(sanitizedHtml);
  const document = interpretedHtml?.window?.document;
  const reader = new Readability(document);

  if (!isProbablyReaderable(document)) {
    throw new Error("Probably not readerable.");
  }

  const article = reader.parse();

  if (!article || !article.textContent) {
    throw new Error("Not a valid article.");
  }

  const textContent = normalizeWhiteSpaces(article?.textContent);
  console.log(textContent);
  // save in sqlite
  await db.insert(articles).values({ url, content: textContent });
};

export default extractArticleText;