export type RequestWithCookies = Request & {
  cookies?: Record<string, string> | undefined;
  user: { userId: string };
};