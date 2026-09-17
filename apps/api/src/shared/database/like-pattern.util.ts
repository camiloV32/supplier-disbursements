export function toContainsPattern(value: string): string {
    const escaped = value.replace(/[\\%_]/g, (match) => `\\${match}`);

    return `%${escaped}%`;
}
