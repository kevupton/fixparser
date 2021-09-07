import { FIXParser } from '../src/FIXParser';
import { mockLicense } from './setup';

jest.setTimeout(30000);

describe('FIXParser', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    it('#connect with no license', () => {
        const fixParser: FIXParser = new FIXParser();

        mockLicense.mockReturnValue(false);
        // Connect with a client
        fixParser.connect({
            host: 'localhost',
            port: 9800,
            protocol: 'tcp',
        });
        expect(mockLicense).toHaveBeenCalled();
        mockLicense.mockReturnValue(true);
    });
});
