"use client";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AppProvider>{children}</AppProvider>
        </AuthProvider>
    );
}
