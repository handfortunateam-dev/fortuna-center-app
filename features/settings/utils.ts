export const unwrapValue = (val: string | undefined | null) => {
    if (!val) return val;
    let current = val;
    for (let i = 0; i < 5; i++) {
        try {
            const parsed = JSON.parse(current);
            if (typeof parsed !== "string") return parsed;
            current = parsed;
        } catch {
            break;
        }
    }
    return current;
};

export const isValidIp = (ip: string) => {
    return (
        /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
        ip.split(".").every((n) => parseInt(n) <= 255)
    );
};
