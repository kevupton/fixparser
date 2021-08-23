import { FIXServer, EncryptMethod, Field, Fields, Message, Messages, Protocol, LicenseManager } from '../src/FIXServer';
import { FIXParser } from '../src/FIXParser';
import { mockLicense } from './setup';

jest.setTimeout(30000);

describe('FIXServer', () => {
    let fixServer: FIXServer = new FIXServer();
    let fixParser: FIXParser = new FIXParser();

    describe('FIXServer', () => {
        it('#connect with no license', () => {
            mockLicense.mockReturnValue(false);
            fixServer = new FIXServer();
            fixParser = new FIXParser();
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

    describe('TCP', () => {
        const PROTOCOL: Protocol = 'tcp';

        it('End-to-end: connect and Logon', (done) => {
            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';
            const PORT: number = 9801;

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port: PORT,
                protocol: PROTOCOL,
                sender: 'SERVER',
                target: 'CLIENT',
                logging: false,
            });

            // Listen for messages
            fixServer.on('message', (message: Message) => {
                expect(fixServer.isConnected()).toBeTruthy();
                expect(fixParser.isConnected()).toBeTruthy();
                expect(message.description).toEqual('Logon');
                expect(message.messageString).toMatchSnapshot();
                expect(message.messageString).toEqual(message.encode());
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port: PORT,
                protocol: PROTOCOL,
                sender: 'CLIENT',
                target: 'SERVER',
                fixVersion: 'FIX.4.7',
                logging: false,
            });

            expect(mockLicense).toHaveBeenCalled();

            fixParser.on('open', () => {
                expect(fixParser.isConnected()).toBeTruthy();

                // Send a Logon message
                const logon: Message = fixParser.createMessage(
                    new Field(Fields.MsgType, Messages.Logon),
                    new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
                    new Field(Fields.SenderCompID, fixParser.sender),
                    new Field(Fields.SendingTime, fixParser.getTimestamp()),
                    new Field(Fields.TargetCompID, fixParser.target),
                    new Field(Fields.ResetSeqNumFlag, 'Y'),
                    new Field(Fields.EncryptMethod, EncryptMethod.None),
                    new Field(Fields.HeartBtInt, 64),
                );
                fixParser.send(logon);
            });
            fixParser.on('message', (message: Message) => {
                expect(message.description).toEqual('Logon');
                expect(message.messageString).toMatchSnapshot();
                expect(message.messageString).toEqual(message.encode());
                expect(fixServer.heartBeatInterval).toEqual(64);
                expect(fixServer.fixVersion).toEqual('FIX.4.7');
                fixParser.close();
                fixServer.destroy();
                done();
            });
            fixParser.on('error', (error) => {
                console.log('FIXParser: ', error);
            });
        });

        it('End-to-end: invalid Logon', (done) => {
            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';
            const PORT: number = 9802;

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port: PORT,
                protocol: PROTOCOL,
                sender: 'SERVER',
                target: 'CLIENT',
                logging: false,
            });

            // Listen for messages
            fixServer.on('message', (message: Message) => {
                expect(fixServer.isConnected()).toBeTruthy();
                expect(fixParser.isConnected()).toBeTruthy();
                expect(message.description).toEqual('Logon');
                expect(message.messageString).toMatchSnapshot();
                expect(message.messageString).toEqual(message.encode());
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port: PORT,
                protocol: PROTOCOL,
                sender: 'INVALID_SENDER',
                target: 'INVALID_TARGET',
                fixVersion: 'FIX.5.0',
                logging: false,
            });

            expect(mockLicense).toHaveBeenCalled();

            fixParser.on('open', () => {
                expect(fixParser.isConnected()).toBeTruthy();

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
            });
            fixParser.on('message', (message: Message) => {
                expect(message.description).toEqual('Logout');
                expect(message.messageString).toMatchSnapshot();
                expect(message.messageString).toEqual(message.encode());
                fixParser.close();
                fixServer.destroy();
                done();
            });
            fixParser.on('error', (error) => {
                console.log('FIXParser: ', error);
            });
        });
    });

    describe('Websocket', () => {
        const PROTOCOL: Protocol = 'websocket';

        it('End-to-end: connect and Logon', (done) => {
            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';
            const PORT: number = 9803;

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port: PORT,
                protocol: PROTOCOL,
                sender: 'SERVER2',
                target: 'CLIENT2',
                logging: false,
            });
            fixServer.on('error', (error) => {
                console.log('FIXServer: ', error);
            });

            // Listen for messages
            fixServer.on('message', (message: Message) => {
                expect(fixServer.isConnected()).toBeTruthy();
                expect(fixParser.isConnected()).toBeTruthy();
                expect(message.description).toEqual('Logon');
                expect(message.messageString).toMatchSnapshot();
                expect(message.messageString).toEqual(message.encode());
                expect(fixServer.heartBeatInterval).toEqual(128);
                expect(fixServer.fixVersion).toEqual('FIX.4.6');
                fixParser.close();
                fixServer.destroy();
                done();
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port: PORT,
                protocol: PROTOCOL,
                sender: 'CLIENT2',
                target: 'SERVER2',
                fixVersion: 'FIX.4.6',
                logging: false,
            });

            expect(mockLicense).toHaveBeenCalled();

            fixParser.on('open', () => {
                expect(fixParser.isConnected()).toBeTruthy();

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
            });
            fixParser.on('error', (error) => {
                console.log('FIXParser: ', error);
            });
        });

        it('End-to-end: invalid Logon', (done) => {
            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';
            const PORT: number = 9804;

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port: PORT,
                protocol: PROTOCOL,
                sender: 'SERVER33',
                target: 'CLIENT33',
                logging: false,
            });
            fixServer.on('error', (error) => {
                console.log('FIXServer: ', error);
            });

            // Listen for messages
            fixServer.on('message', (message: Message) => {
                expect(fixServer.isConnected()).toBeTruthy();
                expect(fixParser.isConnected()).toBeTruthy();
                expect(message.description).toEqual('Logon');
                expect(message.messageString).toMatchSnapshot();
                expect(message.messageString).toEqual(message.encode());
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port: PORT,
                protocol: PROTOCOL,
                sender: 'INVALID_SENDER',
                target: 'INVALID_TARGET',
                fixVersion: 'FIX.5.0',
                logging: false,
            });

            expect(mockLicense).toHaveBeenCalled();

            fixParser.on('open', () => {
                expect(fixParser.isConnected()).toBeTruthy();

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
            });
            fixParser.on('message', (message: Message) => {
                expect(message.description).toEqual('Logout');
                expect(message.messageString).toMatchSnapshot();
                expect(message.messageString).toEqual(message.encode());
                fixParser.close();
                fixServer.destroy();
                done();
            });
            fixParser.on('error', (error) => {
                console.log('FIXParser: ', error);
            });
        });
    });
});
