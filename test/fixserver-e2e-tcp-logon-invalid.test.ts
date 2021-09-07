import { FIXServer, EncryptMethod, Field, Fields, Message, Messages } from '../src/FIXServer';
import { FIXParser } from '../src/FIXParser';

jest.setTimeout(30000);

describe('FIXServer TCP', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    it('End-to-end: invalid Logon', (done) => {
        const fixServer: FIXServer = new FIXServer();
        const fixParser: FIXParser = new FIXParser();
        const HOST: string = 'localhost';

        // Start up a server
        fixServer.createServer({
            host: HOST,
            port: 9802,
            protocol: 'tcp',
            sender: 'SERVER',
            target: 'CLIENT',
            logging: false,
            onMessage: (message: Message) => {
                expect(message.description).toEqual('Logon');
                expect(message.messageString).toMatchSnapshot();
            },
            onReady: () => {
                // Connect with a client
                fixParser.connect({
                    host: HOST,
                    port: 9802,
                    protocol: 'tcp',
                    sender: 'INVALID_SENDER',
                    target: 'INVALID_TARGET',
                    fixVersion: 'FIX.5.0',
                    logging: false,
                    onOpen: () => {
                        // Send a Logon message
                        const logon: Message = fixParser.createMessage(
                            new Field(Fields.MsgType, Messages.Logon),
                            new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
                            new Field(Fields.SenderCompID, fixParser.sender),
                            new Field(Fields.SendingTime, fixParser.getTimestamp()),
                            new Field(Fields.TargetCompID, fixParser.target),
                            new Field(Fields.ResetSeqNumFlag, 'Y'),
                            new Field(Fields.EncryptMethod, EncryptMethod.None),
                            new Field(Fields.HeartBtInt, 60),
                        );
                        fixParser.send(logon);
                    },
                    onMessage: (message: Message) => {
                        expect(message.description).toEqual('Logout');
                        expect(message.messageString).toMatchSnapshot();
                        fixParser.close();
                        fixServer.destroy();
                        done();
                    },
                    onError: (error?: Error) => console.log('FIXParser: ', error),
                });
            },
        });
    });
});
