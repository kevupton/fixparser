const KEY_STRING: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const atobLookup = (character: string): number | undefined => {
    const index: number = KEY_STRING.indexOf(character);
    return index < 0 ? undefined : index;
};

export const atob = (input: string): string | null => {
    let data: string = `${input}`;
    data = data.replace(/[ \t\n\f\r]/g, '');

    if (data.length % 4 === 0) {
        data = data.replace(/==?$/, '');
    }

    if (data.length % 4 === 1 || /[^+/0-9A-Za-z]/.test(data)) {
        return null;
    }

    let output: string = '';
    let buffer: number = 0;
    let accumulatedBits: number = 0;

    [...data].forEach((character: string) => {
        buffer <<= 6;
        buffer |= atobLookup(character)!;
        accumulatedBits += 6;
        if (accumulatedBits === 24) {
            output += String.fromCharCode((buffer & 0xff0000) >> 16);
            output += String.fromCharCode((buffer & 0xff00) >> 8);
            output += String.fromCharCode(buffer & 0xff);
            buffer = accumulatedBits = 0;
        }
    });

    if (accumulatedBits === 12) {
        buffer >>= 4;
        output += String.fromCharCode(buffer);
    } else if (accumulatedBits === 18) {
        buffer >>= 2;
        output += String.fromCharCode((buffer & 0xff00) >> 8);
        output += String.fromCharCode(buffer & 0xff);
    }
    return output;
};
