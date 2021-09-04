import { FIXServer } from '../src/FIXServer';
import { FIXParser } from '../src/FIXParser';

import { Field } from '../src/fields/Field';
import { handleLogon } from '../src/session/SessionLogon';
import { MessageBuffer } from '../src/util/MessageBuffer';
import { Message } from '../src/message/Message';
import { loggingSettings, timestamp } from '../src/util/util';

import { FieldEnum } from '../src/fieldtypes/FieldEnum';
import { EncryptMethodEnum } from '../src/fieldtypes/EncryptMethodEnum';
import { MessageEnum } from '../src/fieldtypes/MessageEnum';
import { handleLogout } from '../src/session/SessionLogout';
import { handleResendRequest } from '../src/session/SessionResendRequest';
import { handleSequenceReset } from '../src/session/SessionSequenceReset';
import { handleTestRequest } from '../src/session/SessionTestRequest';
import { heartBeat } from '../src/messagetemplates/MessageTemplates';

jest.mock('../src/FIXServer');
const mockFIXServer = FIXServer as jest.MockedClass<typeof FIXServer>;

const mockSend = jest.fn();
mockFIXServer.prototype.send = mockSend;

jest.mock('../src/FIXParser');
const mockFIXParser = FIXParser as jest.MockedClass<typeof FIXParser>;
mockFIXServer.prototype.fixParser = new mockFIXParser();

jest.mock('../src/messagetemplates/MessageTemplates', () => ({
    heartBeat: jest.fn().mockReturnValue('a heartbeat message'),
}));

loggingSettings.enabled = false;

describe('FIXParser', () => {
    describe('Session', () => {
        it('Handle Logon (FIXServer)', () => {
            const mockFIXServerInstance = new mockFIXServer();

            const TEST_FIX_VERSION: string = 'FIX.0.0';
            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXServer';
            mockFIXServerInstance.protocol = 'tcp';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;
            mockFIXServerInstance.nextNumIn = 1;

            const hb1: Message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
                new Field(FieldEnum.MsgSeqNum, 0),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.TargetCompID, TARGET),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
            );
            const hb2: Message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
                new Field(FieldEnum.MsgSeqNum, 1),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.TargetCompID, TARGET),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
            );
            const hb3: Message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
                new Field(FieldEnum.MsgSeqNum, 2),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.TargetCompID, TARGET),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
            );

            const mb = new MessageBuffer();
            mb.add(hb1);
            mb.add(hb2);
            mb.add(hb3);

            expect(mb.size()).toEqual(3);

            const message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.Logon),
                new Field(FieldEnum.MsgSeqNum, 1),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
                new Field(FieldEnum.TargetCompID, TARGET),
                new Field(FieldEnum.ResetSeqNumFlag, 'Y'),
                new Field(FieldEnum.EncryptMethod, EncryptMethodEnum.None),
                new Field(FieldEnum.HeartBtInt, 112233),
            );
            const result: boolean = handleLogon(mockFIXServerInstance, mb, message);
            expect(result).toBeTruthy();
            expect(mockFIXServerInstance.fixVersion).toEqual(TEST_FIX_VERSION);
            expect(mockFIXServerInstance.fixParser.fixVersion).toEqual(TEST_FIX_VERSION);
            expect(mockFIXServerInstance.fixParser.heartBeatInterval).toEqual(112233);
            expect(mockFIXServerInstance.heartBeatInterval).toEqual(112233);
            expect(mb.size()).toEqual(3);
        });

        it('Handle Logout', () => {
            const fixServer = new FIXServer();

            fixServer.socket = jest.fn() as any;

            const msg = new Message();
            const spyCreateMessage = jest.spyOn(fixServer, 'createMessage').mockReturnValue(msg);
            const spySend = jest.spyOn(fixServer, 'send');

            const SENDER = 'xyz';
            const TARGET = 'abc';
            fixServer.parserName = 'FIXServer';
            fixServer.protocol = 'tcp';
            fixServer.sender = TARGET;
            fixServer.target = SENDER;
            const message = new Message(
                'FIX.0.1',
                new Field(FieldEnum.BeginString, 'FIX.0.1'),
                new Field(FieldEnum.MsgType, MessageEnum.Logout),
                new Field(FieldEnum.MsgSeqNum, 1),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
                new Field(FieldEnum.TargetCompID, TARGET),
            );
            handleLogout(fixServer, message);
            expect(spyCreateMessage).toHaveBeenCalled();
            expect(spySend).toHaveBeenCalledWith(msg);
            expect(fixServer.stopHeartbeat).toHaveBeenCalled();
            expect(fixServer.close).toHaveBeenCalled();
        });

        it('Handle Resend Request', () => {
            const mockFIXServerInstance = new mockFIXServer();

            const TEST_FIX_VERSION: string = 'FIX.0.0';
            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXServer';
            mockFIXServerInstance.protocol = 'tcp';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;

            const hb1: Message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
                new Field(FieldEnum.MsgSeqNum, 0),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.TargetCompID, TARGET),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
            );

            const hb2: Message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
                new Field(FieldEnum.MsgSeqNum, 1),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.TargetCompID, TARGET),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
            );
            const hb3: Message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
                new Field(FieldEnum.MsgSeqNum, 2),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.TargetCompID, TARGET),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
            );

            const mb = new MessageBuffer();
            mb.add(hb1);
            mb.add(hb2);
            mb.add(hb3);

            expect(mb.size()).toEqual(3);

            const message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.ResendRequest),
                new Field(FieldEnum.BeginSeqNo, 1),
                new Field(FieldEnum.EndSeqNo, 2),
            );
            handleResendRequest(mockFIXServerInstance, mb, message);
            expect(mockFIXServerInstance.send).toHaveBeenCalledTimes(2);
        });

        it('Handle Sequence Reset (FIXServer)', () => {
            const mockFIXServerInstance = new mockFIXServer();

            const TEST_FIX_VERSION: string = 'FIX.4.9';
            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXServer';
            mockFIXServerInstance.protocol = 'tcp';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;

            const message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.SequenceReset),
                new Field(FieldEnum.NewSeqNo, 8899),
            );
            handleSequenceReset(mockFIXServerInstance, message);
            expect(mockFIXServerInstance.setNextTargetMsgSeqNum).toHaveBeenCalledWith(8899);
        });

        it('Handle Sequence Reset (FIXParser)', () => {
            const mockFIXServerInstance = new mockFIXServer();

            const TEST_FIX_VERSION: string = 'FIX.4.9';
            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXParser';
            mockFIXServerInstance.protocol = 'websocket';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;

            const message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.MsgType, MessageEnum.SequenceReset),
                new Field(FieldEnum.NewSeqNo, 131072),
            );
            handleSequenceReset(mockFIXServerInstance, message);
            expect(mockFIXServerInstance.nextNumIn).toEqual(131072);
        });

        it('Handle Test Request (FIXServer)', () => {
            const mockFIXServerInstance = new mockFIXServer();

            const TEST_FIX_VERSION: string = 'FIX.4.9';
            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXServer';
            mockFIXServerInstance.protocol = 'tcp';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;

            const message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.TestReqID, 'This is the test request...'),
            );

            handleTestRequest(mockFIXServerInstance, message);
            expect(heartBeat).toHaveBeenCalledWith(
                mockFIXServerInstance,
                expect.objectContaining({ tag: FieldEnum.TestReqID, value: 'This is the test request...' }),
            );
            expect(mockFIXServerInstance.send).toHaveBeenCalledWith('a heartbeat message');
        });

        it('Handle Test Request (FIXParser)', () => {
            const mockFIXServerInstance = new mockFIXServer();

            const TEST_FIX_VERSION: string = 'FIX.4.9';
            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXParser';
            mockFIXServerInstance.protocol = 'websocket';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;

            const message = new Message(
                TEST_FIX_VERSION,
                new Field(FieldEnum.BeginString, TEST_FIX_VERSION),
                new Field(FieldEnum.TestReqID, 'This is the test request 2...'),
            );

            handleTestRequest(mockFIXServerInstance, message);
            expect(heartBeat).toHaveBeenCalledWith(
                mockFIXServerInstance,
                expect.objectContaining({ tag: FieldEnum.TestReqID, value: 'This is the test request 2...' }),
            );
            expect(mockFIXServerInstance.send).toHaveBeenCalledWith('a heartbeat message');
        });
    });
});
