import { FIXServer, EncryptMethod, Field, Fields, Message, Messages } from '../src/FIXServer';
import { FIXParser } from '../src/FIXParser';

jest.setTimeout(30000);

describe('FIXServer WebSocket', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    it('End-to-end: connect and Logon', (done) => {
        const fixServer: FIXServer = new FIXServer();
        const fixParser: FIXParser = new FIXParser();
        const HOST: string = 'localhost';

        // Start up a server
        fixServer.createServer({
            host: HOST,
            port: 9905,
            protocol: 'websocket',
            sender: 'SERVER2',
            target: 'CLIENT2',
            logging: false,
            onMessage: (message: Message) => {
                expect(message.description).toEqual('Logon');
                expect(message.messageString).toMatchSnapshot();
                expect(fixServer.heartBeatInterval).toEqual(128);
                expect(fixServer.fixVersion).toEqual('FIX.4.6');
                fixParser.close();
                fixServer.destroy();
                done();
            },
            onReady: () => {
                // Connect with a client
                fixParser.connect({
                    host: HOST,
                    port: 9905,
                    protocol: 'websocket',
                    sender: 'CLIENT2',
                    target: 'SERVER2',
                    fixVersion: 'FIX.4.6',
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
                            new Field(Fields.HeartBtInt, 128),
                        );
                        fixParser.send(logon);
                    },
                    onError: (error?: Error) => console.log('FIXParser: ', error),
                });
            },
            onError: (error?: Error) => console.log('FIXServer: ', error),
        });
    });
});
