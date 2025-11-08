import { createServer } from "http";
import { parse } from "url";

export const handler = (req, res) => {
  const parsedUrl = parse(req.url, true);
  req.query = parsedUrl.query;
  req.path = parsedUrl.pathname;
};
