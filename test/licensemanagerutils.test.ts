import { atob } from '../src/licensemanager/LicenseManagerUtils';

describe('Base64', () => {
    const unEncoded: string = 'Hello, World!';
    const encoded: string = 'SGVsbG8sIFdvcmxkIQ==';

    it('decode', () => {
        expect(atob(encoded)).toEqual(unEncoded);
    });
});
