import { FIXServer, EncryptMethod, Field, Fields, Message, Messages } from '../src/FIXServer';
import { FIXParser } from '../src/FIXParser';
import { mockLicense } from './setup';

jest.setTimeout(30000);

describe('FIXServer WebSocket', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    it('End-to-end: invalid MsgSeqNum', (done) => {
        const fixServer: FIXServer = new FIXServer();
        const fixParser: FIXParser = new FIXParser();
        const HOST: string = 'localhost';

        // Start up a server
        fixServer.createServer({
            host: HOST,
            port: 9907,
            protocol: 'websocket',
            sender: 'SERVER2',
            target: 'CLIENT2',
            logging: false,
        });
        fixServer.on('error', (error) => {
            console.log('FIXServer: ', error);
        });

        // Listen for messages
        let serverMessageCounter: number = 0;
        fixServer.on('message', (message: Message) => {
            if (serverMessageCounter === 0) {
                expect(message.description).toEqual('Logon');
                expect(message.messageString).toMatchSnapshot();
            } else if (serverMessageCounter === 1) {
                expect(message.description).toEqual('NewOrderSingle');
                expect(message.messageString).toMatchSnapshot();
            }
            serverMessageCounter++;
        });

        fixServer.on('ready', () => {
            // Connect with a client
            fixParser.connect({
                host: HOST,
                port: 9907,
                protocol: 'websocket',
                sender: 'CLIENT2',
                target: 'SERVER2',
                fixVersion: 'FIX.4.6',
                logging: false,
            });

            expect(mockLicense).toHaveBeenCalled();

            fixParser.on('open', () => {
                // Send a Logon message
                const logon: Message = fixParser.createMessage(
                    new Field(Fields.MsgType, Messages.Logon),
                    new Field(Fields.MsgSeqNum, 200),
                    new Field(Fields.SenderCompID, fixParser.sender),
                    new Field(Fields.SendingTime, fixParser.getTimestamp()),
                    new Field(Fields.TargetCompID, fixParser.target),
                    new Field(Fields.ResetSeqNumFlag, 'Y'),
                    new Field(Fields.EncryptMethod, EncryptMethod.None),
                    new Field(Fields.HeartBtInt, 128),
                );
                fixParser.send(logon);

                setTimeout(() => {
                    const invalidMsgSequence: Message = fixParser.createMessage(
                        new Field(Fields.MsgType, Messages.NewOrderSingle),
                        new Field(Fields.MsgSeqNum, 1000),
                        new Field(Fields.SenderCompID, fixParser.sender),
                        new Field(Fields.SendingTime, fixParser.getTimestamp()),
                        new Field(Fields.TargetCompID, fixParser.target),
                    );
                    fixParser.send(invalidMsgSequence);
                }, 500);
            });

            let clientMessageCounter: number = 0;
            fixParser.on('message', (message: Message) => {
                if (clientMessageCounter === 0) {
                    expect(message.description).toEqual('Logon');
                    expect(message.messageString).toMatchSnapshot();
                    expect(fixServer.heartBeatInterval).toEqual(128);
                    expect(fixServer.fixVersion).toEqual('FIX.4.6');
                } else if (clientMessageCounter === 1) {
                    expect(message.description).toEqual('ResendRequest');
                    expect(message.messageString).toMatchSnapshot();
                    fixParser.close();
                    fixServer.destroy();
                    done();
                }
                clientMessageCounter++;
            });
            fixParser.on('error', (error) => {
                console.log('FIXParser: ', error);
            });
        });
    });
});
