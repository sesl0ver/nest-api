import { sanitize } from "isomorphic-dompurify";

export function isValidInput(input: string): boolean {
    const cleaned = input.replace(/[\u200B-\u200D\uFEFF\s]/g, '');
    return cleaned.length > 0;
}

export function isValidXss(text: string, options: {} = {}): string {
    return sanitize(text,  {...options});
}