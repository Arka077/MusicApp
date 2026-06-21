import apiClient from "./api";

export const searchService = {
  searchByQuery: async (query, topK = 10) => {
    const response = await apiClient.post("/search", {
      query,
      top_k: topK,
    });
    return response.data.results || [];
  },
};
