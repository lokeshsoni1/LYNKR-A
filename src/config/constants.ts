export const API_BASE_URL = "https://lynkr-backend-3kal.onrender.com";

export const GOOGLE_CLIENT_ID = "637130191517-59Ihl18p7ic7smq6n6pdom9ejkmk5ju8.apps.googleusercontent.com";

export const formatShortUrl = (codeOrAlias: string) => {
  if (!codeOrAlias) return "";
  if (codeOrAlias.startsWith("http://") || codeOrAlias.startsWith("https://")) return codeOrAlias;
  return `${API_BASE_URL}/${codeOrAlias}`;
};
