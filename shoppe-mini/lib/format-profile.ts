export function maskEmail(email: string) {
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    const visible = local.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(local.length - 2, 4))}@${domain}`;
}

export function maskPhone(phone: string) {
    if (phone.length <= 2) return phone;
    return `${"*".repeat(Math.max(phone.length - 2, 6))}${phone.slice(-2)}`;
}

export function usernameFromEmail(email: string) {
    return email.split("@")[0] ?? email;
}

export function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toLowerCase();
    return `${parts[parts.length - 1][0]}${parts[0][0]}`.toLowerCase();
}
