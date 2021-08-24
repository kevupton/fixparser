import { FIXServer } from '../src/FIXServer';

import { heartBeat } from '../src/messagetemplates/MessageTemplates';
import { FieldEnum } from '../src/fieldtypes/FieldEnum';

jest.mock('../src/FIXServer');
const mockFIXServer = FIXServer as jest.MockedClass<typeof FIXServer>;

describe('FIXParser', () => {
    describe('Templates', () => {
        it('Create HeartBeat message', () => {
            const mockFIXServerInstance = new mockFIXServer();
            const SENDER = 'abc';
            const TARGET = 'xyz';

            mockFIXServerInstance.parserName = 'FIXServer';
            mockFIXServerInstance.protocol = 'tcp';
            mockFIXServerInstance.sender = TARGET;
            mockFIXServerInstance.target = SENDER;

            heartBeat(mockFIXServerInstance);

            expect(mockFIXServerInstance.createMessage).toHaveBeenCalledWith(
                expect.objectContaining({ tag: FieldEnum.BeginString }),
                expect.objectContaining({ tag: FieldEnum.MsgType }),
                expect.objectContaining({ tag: FieldEnum.MsgSeqNum }),
                expect.objectContaining({ tag: FieldEnum.SenderCompID }),
                expect.objectContaining({ tag: FieldEnum.TargetCompID }),
                expect.objectContaining({ tag: FieldEnum.SendingTime }),
            );
        });
    });
});
