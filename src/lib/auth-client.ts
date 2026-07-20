"use client";

import { createAuthClient } from "better-auth/react";

/** Browser-side Better Auth client for the sign-in page. */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
