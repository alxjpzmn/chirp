import { Readability, isProbablyReaderable } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { normalizeWhiteSpaces } from "normalize-text";
import db from "@db/init";

const extractArticleText = async (url: string) => {
  try {
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
    const insert_transcripts_query = db.query(
      "INSERT INTO transcripts (url, content, slug, title) VALUES ($url, $content, $slug, $title)",
    );

    insert_transcripts_query.run({
      $url: url,
      $content: textContent,
      $slug: article?.excerpt,
      $title: article?.title,
    });
  } catch (e) {
    console.error(e);
    throw new Error(`${e}`);
  }
};

export default extractArticleText;
