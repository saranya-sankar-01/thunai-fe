declare global {
  interface Window {
    env?: {
      [key: string]: string | boolean | undefined;
      IS_ENCRYPTION_FLOW?: string | boolean;
      ENCRYPTION_KEY?: string;
      API_ENDPOINT?: string;
    };
  }
}
export {};
