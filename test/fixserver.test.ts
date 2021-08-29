import { FIXServer, EncryptMethod, Field, Fields, Message, Messages, Protocol } from '../src/FIXServer';
import { FIXParser, HandlInst, OrderTypes, Side, TimeInForce } from '../src/FIXParser';
import { mockLicense } from './setup';
import { FieldEnum } from '../src/fieldtypes/FieldEnum';

jest.setTimeout(30000);

describe('FIXServer', () => {
    let fixServer: FIXServer = new FIXServer();
    let fixParser: FIXParser = new FIXParser();
    let port: number = 9800;

    describe('FIXServer', () => {
        it('#connect with no license', () => {
            mockLicense.mockReturnValue(false);
            fixServer = new FIXServer();
            fixParser = new FIXParser();
            // Connect with a client
            fixParser.connect({
                host: 'localhost',
                port,
                protocol: 'tcp',
            });
            expect(mockLicense).toHaveBeenCalled();
            mockLicense.mockReturnValue(true);
        });
    });

    describe('TCP', () => {
        const PROTOCOL: Protocol = 'tcp';

        it('End-to-end: connect and Logon', (done) => {
            port += 2;

            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port,
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
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port,
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
            port += 2;

            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port,
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
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port,
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
                fixParser.close();
                fixServer.destroy();
                done();
            });
            fixParser.on('error', (error) => {
                console.log('FIXParser: ', error);
            });
        });

        it('End-to-end: invalid MsgSeqNum', (done) => {
            port += 2;

            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port,
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
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port,
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
                    new Field(Fields.MsgSeqNum, 100),
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
                expect(message.description).toEqual('ResendRequest');
                expect(message.messageString).toMatchSnapshot();
                expect(fixServer.heartBeatInterval).toEqual(30);
                expect(fixServer.fixVersion).toEqual('FIX.4.7');
                fixParser.close();
                fixServer.destroy();
                done();
            });
            fixParser.on('error', (error) => {
                console.log('FIXParser: ', error);
            });
        });

        it('End-to-end: first message not a Logon', (done) => {
            port += 2;

            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port,
                protocol: PROTOCOL,
                sender: 'SERVER',
                target: 'CLIENT',
                logging: false,
            });

            // Listen for messages
            fixServer.on('message', (message: Message) => {
                expect(fixServer.isConnected()).toBeTruthy();
                expect(fixParser.isConnected()).toBeTruthy();
                expect(message.description).toEqual('NewOrderSingle');
                expect(message.messageString).toMatchSnapshot();
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port,
                protocol: PROTOCOL,
                sender: 'CLIENT',
                target: 'SERVER',
                fixVersion: 'FIX.4.8',
                logging: false,
            });

            expect(mockLicense).toHaveBeenCalled();

            fixParser.on('open', () => {
                expect(fixParser.isConnected()).toBeTruthy();

                // Send anything but a Logon
                const wrongFirstMessage = fixParser.createMessage(
                    new Field(Fields.MsgType, Messages.NewOrderSingle),
                    new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
                    new Field(Fields.SenderCompID, fixParser.sender),
                    new Field(Fields.SendingTime, fixParser.getTimestamp()),
                    new Field(Fields.TargetCompID, fixParser.target),
                    new Field(Fields.ClOrdID, '11223344'),
                    new Field(Fields.HandlInst, HandlInst.AutomatedExecutionNoIntervention),
                    new Field(Fields.OrderQty, '123'),
                    new Field(Fields.TransactTime, fixParser.getTimestamp()),
                    new Field(Fields.OrdType, OrderTypes.Market),
                    new Field(Fields.Side, Side.Buy),
                    new Field(Fields.Symbol, '700.HK'),
                    new Field(Fields.TimeInForce, TimeInForce.Day),
                );
                fixParser.send(wrongFirstMessage);
            });
            fixParser.on('message', (message: Message) => {
                expect(message.description).toEqual('Logout');
                expect(message.messageString).toMatchSnapshot();
                expect(message.getField(FieldEnum.Text)!.value).toEqual('First message not a Logon');
                expect(fixServer.heartBeatInterval).toEqual(30);
                expect(fixServer.fixVersion).toEqual('FIX.5.0SP2');
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
            port += 2;

            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port,
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
                port,
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
            port += 2;

            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port,
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
            });

            expect(fixServer.isConnected()).toBeFalsy();
            expect(fixParser.isConnected()).toBeFalsy();

            // Connect with a client
            fixParser.connect({
                host: HOST,
                port,
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
                fixParser.close();
                fixServer.destroy();
                done();
            });
            fixParser.on('error', (error) => {
                console.log('FIXParser: ', error);
            });
        });

        it('End-to-end: invalid MsgSeqNum', (done) => {
            port += 2;

            fixServer = new FIXServer();
            fixParser = new FIXParser();
            const HOST: string = 'localhost';

            // Start up a server
            fixServer.createServer({
                host: HOST,
                port,
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
                expect(fixServer.heartBeatInterval).toEqual(30);
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
                port,
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
                    new Field(Fields.MsgSeqNum, 200),
                    new Field(Fields.SenderCompID, fixParser.sender),
                    new Field(Fields.SendingTime, fixParser.getTimestamp()),
                    new Field(Fields.TargetCompID, fixParser.target),
                    new Field(Fields.ResetSeqNumFlag, 'Y'),
                    new Field(Fields.EncryptMethod, EncryptMethod.None),
                    new Field(Fields.HeartBtInt, 128),
                );
                fixParser.send(logon);
            });
            fixParser.on('message', (message: Message) => {
                expect(message.description).toEqual('ResendRequest');
                expect(message.messageString).toMatchSnapshot();
                expect(fixServer.heartBeatInterval).toEqual(30);
                expect(fixServer.fixVersion).toEqual('FIX.4.6');
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
