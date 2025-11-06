export function enableCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://hay-card-front-end.vercel.app"); // your front-end URL
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
