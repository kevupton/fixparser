import { FIXParser } from '../../src/FIXParser';
import { Message } from '../../src/message/Message';
import { Field } from '../../src/fields/Field';
import { FieldEnum } from '../../src/fieldtypes/FieldEnum';
import { MessageEnum } from '../../src/fieldtypes/MessageEnum';

describe('Message', () => {
    const fixParser = new FIXParser();
    const fixVersion: string = 'FIX4.49';
    const fields: Field[] = [
        new Field(FieldEnum.BeginString, fixVersion),
        new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
        new Field(FieldEnum.MsgSeqNum, 1),
        new Field(FieldEnum.SenderCompID, 'SENDER'),
        new Field(FieldEnum.TargetCompID, 'TARGET'),
        new Field(FieldEnum.SendingTime, '20090323-15:40:29'),
    ];
    const newMessage: Message = new Message(fixVersion, ...fields);
    const encoded: string = newMessage.encode();
    const message: Message = fixParser.parse(encoded)[0];

    it('#getBriefDescription()', () => {
        expect(message.getBriefDescription()).toEqual('Heartbeat');
    });

    it('#getField()', () => {
        expect(message.getField(FieldEnum.MsgSeqNum)!.tag).toEqual(fields[2].tag);
        expect(message.getField(FieldEnum.MsgSeqNum)!.value).toEqual(fields[2].value);
    });

    it('#getFields()', () => {
        expect(message.getFields(FieldEnum.MsgSeqNum)!.length).toEqual(1);
        expect(message.getFields(FieldEnum.MsgSeqNum)![0].tag).toEqual(fields[2].tag);
        expect(message.getFields(FieldEnum.MsgSeqNum)![0].value).toEqual(fields[2].value);
    });

    it('#getFieldValues()', () => {
        expect(message.getFieldValues()).toEqual({
            8: 'FIX4.49',
            10: '159',
            34: 1,
            35: '0',
            49: 'SENDER',
            52: '20090323-15:40:29',
            56: 'TARGET',
            9: 51,
        });
    });

    it('#getFieldNameValues()', () => {
        expect(message.getFieldNameValues()).toEqual({
            BeginString: 'FIX4.49',
            BodyLength: 51,
            CheckSum: '159',
            MsgSeqNum: 1,
            MsgType: '0',
            SenderCompID: 'SENDER',
            SendingTime: '20090323-15:40:29',
            TargetCompID: 'TARGET',
        });
    });

    it('#getFieldExplains()', () => {
        expect(message.getFieldExplains()).toEqual({
            BeginString: 'FIX4.49',
            BodyLength: 51,
            CheckSum: '159',
            MsgSeqNum: 1,
            MsgType: 'Heartbeat',
            SenderCompID: 'SENDER',
            SendingTime: '20090323-15:40:29',
            TargetCompID: 'TARGET',
        });
    });
});
