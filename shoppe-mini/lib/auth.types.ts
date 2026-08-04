export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
};

export function parseAuthResponse(data: unknown): AuthResponse | null {
    if (
        typeof data === "object" &&
        data !== null &&
        "accessToken" in data &&
        "refreshToken" in data &&
        typeof (data as AuthResponse).accessToken === "string" &&
        typeof (data as AuthResponse).refreshToken === "string"
    ) {
        return data as AuthResponse;
    }
    return null;
}