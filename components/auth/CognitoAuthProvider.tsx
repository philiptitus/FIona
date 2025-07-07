"use client";

import { AuthProvider } from "react-oidc-context";
import { cognitoAuthConfig } from "@/lib/cognitoAuthConfig";

export default function CognitoAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider {...cognitoAuthConfig}>
      {children}
    </AuthProvider>
  );
} 