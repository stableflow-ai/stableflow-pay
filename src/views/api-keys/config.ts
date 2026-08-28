export const API_KEY_LABEL_MAX_LENGTH = 200;

export const API_KEY_TABLE_COLUMNS =
  "minmax(140px,1.2fr) minmax(180px,1.4fr) minmax(160px,1fr) minmax(72px,auto)";

export const API_KEY_DIALOG_MODE = {
  Create: "create",
  Edit: "edit",
} as const;

export type ApiKeyDialogMode = (typeof API_KEY_DIALOG_MODE)[keyof typeof API_KEY_DIALOG_MODE];
