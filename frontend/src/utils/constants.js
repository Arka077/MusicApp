export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  LIBRARY: "/library",
  SEARCH: "/search",
  ALBUM: "/album/:id",
  PROFILE: "/profile",
  UPLOAD: "/upload",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};
