// CSRF token storage for use across API calls
// After login/signup, store the token here for subsequent requests
let csrfToken: string | null = null;

export const setCSRFToken = (token: string) => {
  csrfToken = token;
};

export const getCSRFToken = (): string | null => {
  return csrfToken;
};

export const clearCSRFToken = () => {
  csrfToken = null;
};
