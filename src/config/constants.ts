export const API_BASE_URL = "https://lynkr-backend-3kal.onrender.com";

export const formatShortUrl = (codeOrAlias: string) => {
  if (!codeOrAlias) return "";
  if (codeOrAlias.startsWith("http://") || codeOrAlias.startsWith("https://")) return codeOrAlias;
  return `${API_BASE_URL}/${codeOrAlias}`;
};
