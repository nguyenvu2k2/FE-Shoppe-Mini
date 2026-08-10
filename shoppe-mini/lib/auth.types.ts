import type { User } from "@/src/app/(store)/auth/auth..store";

function isUser(data: unknown): data is User {
    return (
        typeof data === "object" &&
        data !== null &&
        "id" in data &&
        "email" in data &&
        "fullName" in data &&
        "role" in data
    );
}

export function parseUserResponse(data: unknown): User | null {
    if (typeof data !== "object" || data === null) {
        return null;
    }

    if ("user" in data) {
        return parseUserResponse((data as { user: unknown }).user);
    }

    return isUser(data) ? data : null;
}
