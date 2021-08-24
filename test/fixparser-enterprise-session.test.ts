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

jest.mock('../src/FIXServer');
const mockFIXServer = FIXServer as jest.MockedClass<typeof FIXServer>;

const mockSend = jest.fn();
mockFIXServer.prototype.send = mockSend;

jest.mock('../src/FIXParser');
const mockFIXParser = FIXParser as jest.MockedClass<typeof FIXParser>;
mockFIXServer.prototype.fixParser = new mockFIXParser();

loggingSettings.enabled = false;

describe('FIXParser', () => {
    describe('Session', () => {
        it('Handle Logon (FIXServer)', () => {
            const mockFIXServerInstance = new mockFIXServer();

            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXServer';
            mockFIXServerInstance.protocol = 'tcp';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;

            const TEST_FIX_VERSION: string = 'FIX.0.0';

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
            handleLogon(mockFIXServerInstance, mb, message);
            expect(mockFIXServerInstance.send).toHaveBeenCalled();
            expect(mockFIXServerInstance.fixVersion).toEqual(TEST_FIX_VERSION);
            expect(mockFIXServerInstance.fixParser.fixVersion).toEqual(TEST_FIX_VERSION);
            expect(mockFIXServerInstance.fixParser.heartBeatInterval).toEqual(112233);
            expect(mockFIXServerInstance.heartBeatInterval).toEqual(112233);
            expect(mb.size()).toEqual(0); // ResetSeqNumFlag=Y should clear MessageBuffer
        });
        it('Handle Logout', () => {
            const mockFIXServerInstance = new mockFIXServer();
            const SENDER = 'xyz';
            const TARGET = 'abc';
            mockFIXServerInstance.parserName = 'FIXServer';
            mockFIXServerInstance.protocol = 'tcp';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;
            const message = new Message(
                'FIX.0.1',
                new Field(FieldEnum.BeginString, 'FIX.0.1'),
                new Field(FieldEnum.MsgType, MessageEnum.Logout),
                new Field(FieldEnum.MsgSeqNum, 1),
                new Field(FieldEnum.SenderCompID, SENDER),
                new Field(FieldEnum.SendingTime, timestamp(new Date())),
                new Field(FieldEnum.TargetCompID, TARGET),
            );
            handleLogout(mockFIXServerInstance, message);
            expect(mockFIXServerInstance.send).toHaveBeenCalled();
            expect(mockFIXServerInstance.stopHeartbeat).toHaveBeenCalled();
            expect(mockFIXServerInstance.close).toHaveBeenCalled();
        });
        it('Handle Resend Request', () => {
            const mockFIXServerInstance = new mockFIXServer();

            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXServer';
            mockFIXServerInstance.protocol = 'tcp';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;

            const TEST_FIX_VERSION: string = 'FIX.0.0';

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
    });
});
