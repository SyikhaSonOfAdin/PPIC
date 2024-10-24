export type user = {
  ID: string;
  COMPANY_ID: string;
  COMPANY_NAME: string;
  PROJECT_ID: string;
  USERNAME: string;
  EMAIL: string;
  PASSWORD: string;
  SINCE: string;
};

export type permission = {
  ID: string;
  NAME: string;
  DESCRIPTION: string;
};

export type drawing = {
  ID: string;
  ISO_NO: string;
  VERSION: string;
  FILE_NAME: string;
};
