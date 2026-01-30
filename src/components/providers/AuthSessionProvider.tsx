"use client";

import type { ReactElement, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

type AuthSessionProviderProps = {
  children: ReactNode;
};

export default function AuthSessionProvider({
  children,
}: AuthSessionProviderProps): ReactElement {
  return <SessionProvider>{children}</SessionProvider>;
}
