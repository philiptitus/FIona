export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/access/login/",
    REGISTER: "/access/register/",
    DELETE_ACCOUNT: "/access/delete/",
    UPDATE_PROFILE: "/access/update/",
    PASSWORD_RESET: "/access/password-reset/",
    PASSWORD_RESET_CONFIRM: (uidb64: string, token: string) => `/access/password-reset-confirm/${uidb64}/${token}/`,
    SET_NEW_PASSWORD: "/access/set-new-password/",
    PROFILE: "/access/profile/",
  },
} as const

