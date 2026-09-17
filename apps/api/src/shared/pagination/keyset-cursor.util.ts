export type KeysetCursor = {
    createdAt: Date;
    id: string;
};

export function encodeKeysetCursor(cursor: KeysetCursor): string {
    const payload = JSON.stringify({ createdAt: cursor.createdAt.toISOString(), id: cursor.id });

    return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeKeysetCursor(cursor: string): KeysetCursor | null {
    try {
        const payload = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));

        if (typeof payload?.id !== "string" || typeof payload?.createdAt !== "string") {
            return null;
        }

        const createdAt = new Date(payload.createdAt);

        if (Number.isNaN(createdAt.getTime())) {
            return null;
        }

        return { createdAt, id: payload.id };
    } catch {
        return null;
    }
}
