import FIXParser, { Message, Field, Fields, Messages, EncryptMethod } from '../src/FIXParser';

describe('FIXEncoder', () => {
    const fixParser: FIXParser = new FIXParser();

    describe('#encode: tag ordering', () => {
        const fixString: string = '8=FIX.5.0SP2|9=34|35=1|49=ABC|56=XYZ|34=1|112=reqId|10=106|';

        it('should have encoded the FIX message in correct order 1', () => {
            const message: Message = fixParser.createMessage(
                new Field(Fields.MsgType, Messages.TestRequest),
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.TargetCompID, 'XYZ'),
                new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
                new Field(Fields.TestReqID, 'reqId'),
            );
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message).toMatchSnapshot();
        });

        it('should have encoded the FIX message in correct order 2', () => {
            const message: Message = fixParser.createMessage(
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.TargetCompID, 'XYZ'),
                new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
                new Field(Fields.TestReqID, 'reqId'),
                new Field(Fields.MsgType, Messages.TestRequest),
            );
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message).toMatchSnapshot();
        });
    });
    describe('#encode: Heartbeat', () => {
        const fixString: string = '8=FIX.5.0SP2|9=51|35=0|34=703|49=ABC|52=20100130-10:53:40.830|56=XYZ|10=205|';

        it('should have encoded the FIX message', () => {
            const message: Message = fixParser.createMessage(
                new Field(Fields.MsgType, Messages.Heartbeat),
                new Field(Fields.MsgSeqNum, fixParser.setNextTargetMsgSeqNum(703)),
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.SendingTime, fixParser.getTimestamp(new Date(Date.UTC(2010, 0, 30, 10, 53, 40, 830)))),
                new Field(Fields.TargetCompID, 'XYZ'),
            );
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message).toMatchSnapshot();
            expect(message.encode()).toMatchSnapshot();
        });
    });
    describe('#encode: Logon', () => {
        const fixString: string =
            '8=FIX.5.0SP2|9=76|35=A|34=702|49=ABC|52=20100130-10:52:40.663|56=XYZ|95=4|96=1234|98=0|108=60|10=090|';

        it('should have encoded the FIX message', () => {
            const message: Message = fixParser.createMessage(
                new Field(Fields.MsgType, Messages.Logon),
                new Field(Fields.MsgSeqNum, fixParser.setNextTargetMsgSeqNum(702)),
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.SendingTime, fixParser.getTimestamp(new Date(Date.UTC(2010, 0, 30, 10, 52, 40, 663)))),
                new Field(Fields.TargetCompID, 'XYZ'),
                new Field(Fields.RawDataLength, 4),
                new Field(Fields.RawData, 1234),
                new Field(Fields.EncryptMethod, EncryptMethod.None),
                new Field(Fields.HeartBtInt, 60),
            );
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message).toMatchSnapshot();
            expect(message.encode()).toMatchSnapshot();
        });
    });
    describe('#encode: Custom header/trailer', () => {
        let fixString = null;

        it('should have encoded the FIX message with custom FIX version', () => {
            fixString =
                '8=FIX.4.3|9=76|35=A|34=702|49=ABC|52=20100130-10:52:40.663|56=XYZ|95=4|96=1234|98=0|108=60|10=135|';
            const message: Message = fixParser.createMessage(
                new Field(Fields.BeginString, 'FIX.4.3'),
                new Field(Fields.MsgType, Messages.Logon),
                new Field(Fields.MsgSeqNum, fixParser.setNextTargetMsgSeqNum(702)),
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.SendingTime, fixParser.getTimestamp(new Date(Date.UTC(2010, 0, 30, 10, 52, 40, 663)))),
                new Field(Fields.TargetCompID, 'XYZ'),
                new Field(Fields.RawDataLength, 4),
                new Field(Fields.RawData, 1234),
                new Field(Fields.EncryptMethod, EncryptMethod.None),
                new Field(Fields.HeartBtInt, 60),
            );
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message).toMatchSnapshot();
            expect(message.encode()).toMatchSnapshot();
        });

        it('should have encoded the FIX message with custom Fields.BodyLength', () => {
            fixString =
                '8=FIX.5.0SP2|9=123456|35=A|34=702|49=ABC|52=20100130-10:52:40.663|56=XYZ|95=4|96=1234|98=0|108=60|10=034|';
            const message: Message = fixParser.createMessage(
                new Field(Fields.MsgType, Messages.Logon),
                new Field(Fields.MsgSeqNum, fixParser.setNextTargetMsgSeqNum(702)),
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.SendingTime, fixParser.getTimestamp(new Date(Date.UTC(2010, 0, 30, 10, 52, 40, 663)))),
                new Field(Fields.BodyLength, 123456),
                new Field(Fields.TargetCompID, 'XYZ'),
                new Field(Fields.RawDataLength, 4),
                new Field(Fields.RawData, 1234),
                new Field(Fields.EncryptMethod, EncryptMethod.None),
                new Field(Fields.HeartBtInt, 60),
            );
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message).toMatchSnapshot();
            expect(message.encode()).toMatchSnapshot();
        });

        it('should have encoded the FIX message with custom Fields.CheckSum', () => {
            fixString =
                '8=FIX.5.0SP2|9=76|35=A|34=702|49=ABC|52=20100130-10:52:40.663|56=XYZ|95=4|96=1234|98=0|108=60|10=999|';
            const message: Message = fixParser.createMessage(
                new Field(Fields.CheckSum, 999),
                new Field(Fields.MsgType, Messages.Logon),
                new Field(Fields.MsgSeqNum, fixParser.setNextTargetMsgSeqNum(702)),
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.SendingTime, fixParser.getTimestamp(new Date(Date.UTC(2010, 0, 30, 10, 52, 40, 663)))),
                new Field(Fields.TargetCompID, 'XYZ'),
                new Field(Fields.RawDataLength, 4),
                new Field(Fields.RawData, 1234),
                new Field(Fields.EncryptMethod, EncryptMethod.None),
                new Field(Fields.HeartBtInt, 60),
            );
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message).toMatchSnapshot();
            expect(message.encode()).toMatchSnapshot();
        });
    });
    describe('#encode: Multiple encode', () => {
        let fixString =
            '8=FIX.4.3|9=76|35=A|34=702|49=ABC|52=20100130-10:52:40.663|56=XYZ|95=4|96=1234|98=0|108=60|10=135|';

        it('should have encoded the FIX message 1', () => {
            const message: Message = fixParser.createMessage(
                new Field(Fields.BeginString, 'FIX.4.3'),
                new Field(Fields.MsgType, Messages.Logon),
                new Field(Fields.MsgSeqNum, fixParser.setNextTargetMsgSeqNum(702)),
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.SendingTime, fixParser.getTimestamp(new Date(Date.UTC(2010, 0, 30, 10, 52, 40, 663)))),
                new Field(Fields.TargetCompID, 'XYZ'),
                new Field(Fields.RawDataLength, 4),
                new Field(Fields.RawData, 1234),
                new Field(Fields.EncryptMethod, EncryptMethod.None),
                new Field(Fields.HeartBtInt, 60),
            );
            const encodedMessage0: string = message.encode().replace(/\x01/g, '|');
            const encodedMessage1: string = message.encode();
            const encodedMessage2: string = message.encode();
            expect(encodedMessage0).toEqual(fixString);
            expect(encodedMessage1).toEqual(encodedMessage2);
            expect(encodedMessage0).toMatchSnapshot();
            expect(encodedMessage1).toMatchSnapshot();
        });

        it('should have encoded the FIX message 2', () => {
            fixString =
                '8=FIX.5.0SP2|9=76|35=A|34=702|49=ABC|52=20100130-10:52:40.663|56=XYZ|95=4|96=1234|98=0|108=60|10=090|';
            const message: Message = fixParser.createMessage(
                new Field(Fields.MsgType, Messages.Logon),
                new Field(Fields.MsgSeqNum, fixParser.setNextTargetMsgSeqNum(702)),
                new Field(Fields.SenderCompID, 'ABC'),
                new Field(Fields.SendingTime, fixParser.getTimestamp(new Date(Date.UTC(2010, 0, 30, 10, 52, 40, 663)))),
                new Field(Fields.TargetCompID, 'XYZ'),
                new Field(Fields.RawDataLength, 4),
                new Field(Fields.RawData, 1234),
                new Field(Fields.EncryptMethod, EncryptMethod.None),
                new Field(Fields.HeartBtInt, 60),
            );
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(fixParser.parse(message.encode())[0].messageString.replace(/\x01/g, '|')).toEqual(fixString);
            message.encode('-');
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(fixParser.parse(message.encode())[0].messageString.replace(/\x01/g, '|')).toEqual(fixString);
            message.encode('/');
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(fixParser.parse(message.encode())[0].messageString.replace(/\x01/g, '|')).toEqual(fixString);
            message.encode('_');
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(fixParser.parse(message.encode())[0].messageString.replace(/\x01/g, '|')).toEqual(fixString);
            message.encode('*');
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(fixParser.parse(message.encode())[0].messageString.replace(/\x01/g, '|')).toEqual(fixString);
            message.encode('$');
            expect(message.encode().replace(/\x01/g, '|')).toEqual(fixString);
            expect(message).toMatchSnapshot();
            expect(message.encode()).toMatchSnapshot();
        });
    });
});
