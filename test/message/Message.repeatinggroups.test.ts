import { Fields, FIXParser, MDEntryType } from '../../src/FIXParser';
import { Message } from '../../src/message/Message';
import { Field } from '../../src/fields/Field';
import { FieldEnum } from '../../src/fieldtypes/FieldEnum';
import { MessageEnum } from '../../src/fieldtypes/MessageEnum';

describe('Message', () => {
    const fixParser = new FIXParser();
    const fixVersion: string = 'FIX4.49';
    const fields: Field[] = [
        new Field(FieldEnum.BeginString, fixVersion),
        new Field(Fields.MsgType, MessageEnum.MarketDataRequest),
        new Field(Fields.MsgSeqNum, 1),
        new Field(Fields.SenderCompID, 'SENDER'),
        new Field(Fields.TargetCompID, 'TARGET'),
        new Field(FieldEnum.SendingTime, '20090323-15:40:29'),
        new Field(Fields.MarketDepth, 0),
        new Field(Fields.MDUpdateType, 0),
        new Field(Fields.NoRelatedSym, 2),
        new Field(Fields.MDReqID, 1),
        new Field(Fields.SubscriptionRequestType, 1),
        new Field(Fields.NoMDEntryTypes, 5),
        new Field(Fields.MDEntryType, MDEntryType.Bid),
        new Field(Fields.Symbol, 1),
        new Field(Fields.MDEntryType, MDEntryType.Offer),
        new Field(Fields.Symbol, 2),
        new Field(Fields.MDEntryType, MDEntryType.MarketBid),
        new Field(Fields.Symbol, 3),
        new Field(Fields.MDEntryType, MDEntryType.MarketOffer),
        new Field(Fields.Symbol, 4),
        new Field(Fields.MDEntryType, MDEntryType.TradeVolume),
        new Field(Fields.Symbol, 5),
    ];
    const newMessage: Message = new Message(fixVersion, ...fields);
    const encoded: string = newMessage.encode();
    const message: Message = fixParser.parse(encoded)[0];

    it('#getBriefDescription()', () => {
        expect(message.getBriefDescription()).toEqual('MarketDataRequest');
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
            10: '069',
            34: 1,
            35: 'V',
            49: 'SENDER',
            56: 'TARGET',
            52: '20090323-15:40:29',
            264: 0,
            265: 0,
            146: 2,
            262: '1',
            263: '1',
            267: 5,
            269: ['0', '1', 'b', 'c', 'B'],
            55: ['1', '2', '3', '4', '5'],
            9: 142,
        });
    });

    it('#getFieldNameValues()', () => {
        expect(message.getFieldNameValues()).toEqual({
            BeginString: 'FIX4.49',
            BodyLength: 142,
            CheckSum: '069',
            MsgSeqNum: 1,
            MsgType: 'V',
            SenderCompID: 'SENDER',
            SendingTime: '20090323-15:40:29',
            TargetCompID: 'TARGET',
            SubscriptionRequestType: '1',
            NoRelatedSym: 2,
            MarketDepth: 0,
            MDReqID: '1',
            MDUpdateType: 0,
            NoMDEntryTypes: 5,
            MDEntryType: ['0', '1', 'b', 'c', 'B'],
            Symbol: ['1', '2', '3', '4', '5'],
        });
    });

    it('#getFieldExplains()', () => {
        expect(message.getFieldExplains()).toEqual({
            BeginString: 'FIX4.49',
            BodyLength: 142,
            CheckSum: '069',
            MsgSeqNum: 1,
            MsgType: 'MarketDataRequest',
            SenderCompID: 'SENDER',
            SendingTime: '20090323-15:40:29',
            TargetCompID: 'TARGET',
            SubscriptionRequestType: 'SnapshotAndUpdates',
            NoRelatedSym: 2,
            MarketDepth: 0,
            MDReqID: '1',
            MDUpdateType: 'FullRefresh',
            NoMDEntryTypes: 5,
            MDEntryType: ['Bid', 'Offer', 'b', 'c', 'TradeVolume'],
            Symbol: ['1', '2', '3', '4', '5'],
        });
    });

    it('#getGroup()', () => {
        expect(message.getGroup(Fields.NoMDEntryTypes)).toEqual({
            MDEntryType: ['Bid', 'Offer', 'b', 'c', 'TradeVolume'],
            Symbol: ['1', '2', '3', '4', '5'],
        });
    });

    it('#getGroup()', () => {
        const fields: Field[] = [
            new Field(FieldEnum.BeginString, fixVersion),
            new Field(Fields.MsgType, MessageEnum.MarketDataRequest),
            new Field(Fields.MsgSeqNum, 1),
            new Field(Fields.SenderCompID, 'SENDER'),
            new Field(Fields.TargetCompID, 'TARGET'),
            new Field(FieldEnum.SendingTime, '20090323-15:40:29'),
            new Field(Fields.MarketDepth, 0),
            new Field(Fields.MDUpdateType, 0),
            new Field(Fields.NoRelatedSym, 2),
            new Field(Fields.MDReqID, 1),
            new Field(Fields.SubscriptionRequestType, 1),
            new Field(Fields.NoMDEntryTypes, 5),
            new Field(Fields.MDEntryType, MDEntryType.Bid),
            new Field(Fields.Symbol, 1),
            new Field(Fields.MDEntryType, MDEntryType.Offer),
            new Field(Fields.Symbol, 2),
            new Field(Fields.MDEntryType, MDEntryType.MarketBid),
            new Field(Fields.Symbol, 3),
            new Field(Fields.MDEntryType, MDEntryType.MarketOffer),
            new Field(Fields.Symbol, 4),
            new Field(Fields.MDEntryType, MDEntryType.TradeVolume),
            new Field(Fields.Symbol, 5),
            new Field(Fields.NoQuoteSets, 3),
            new Field(Fields.QuoteSetID, 1),
            new Field(Fields.UnderlyingSymbol, 'EUR/USD'),
            new Field(Fields.QuoteSetValidUntilTime, '20090323-15:40:29'),
            new Field(Fields.TotNoQuoteEntries, 1),
            new Field(Fields.LastFragment, 0),
            new Field(Fields.NoQuoteEntries, 3),
            new Field(Fields.QuoteEntryID, 1),
            new Field(Fields.BidSize, 100),
            new Field(Fields.QuoteSetID, 2),
            new Field(Fields.UnderlyingSymbol, 'USD/EUR'),
            new Field(Fields.QuoteSetValidUntilTime, '20090323-15:40:29'),
            new Field(Fields.TotNoQuoteEntries, 1),
            new Field(Fields.LastFragment, 0),
            new Field(Fields.NoQuoteEntries, 3),
            new Field(Fields.QuoteEntryID, 1),
            new Field(Fields.BidSize, 200),
        ];
        const newMessage: Message = new Message(fixVersion, ...fields);
        const encoded: string = newMessage.encode();
        const message: Message = fixParser.parse(encoded)[0];

        expect(message.getGroup(Fields.NoQuoteSets)).toEqual({
            BidSize: [100, 200],
            LastFragment: ['0', '0'],
            NoQuoteEntries: [3, 3],
            QuoteEntryID: ['1', '1'],
            QuoteSetID: ['1', '2'],
            QuoteSetValidUntilTime: ['20090323-15:40:29', '20090323-15:40:29'],
            TotNoQuoteEntries: [1, 1],
            UnderlyingSymbol: ['EUR/USD', 'USD/EUR'],
        });
    });

    it('#getGroupAsArray()', () => {
        const fields: Field[] = [
            new Field(FieldEnum.BeginString, fixVersion),
            new Field(Fields.MsgType, MessageEnum.MarketDataRequest),
            new Field(Fields.MsgSeqNum, 1),
            new Field(Fields.SenderCompID, 'SENDER'),
            new Field(Fields.TargetCompID, 'TARGET'),
            new Field(FieldEnum.SendingTime, '20090323-15:40:29'),
            new Field(Fields.MarketDepth, 0),
            new Field(Fields.MDUpdateType, 0),
            new Field(Fields.NoRelatedSym, 2),
            new Field(Fields.MDReqID, 1),
            new Field(Fields.SubscriptionRequestType, 1),
            new Field(Fields.NoMDEntryTypes, 5),
            new Field(Fields.MDEntryType, MDEntryType.Bid),
            new Field(Fields.Symbol, 1),
            new Field(Fields.MDEntryType, MDEntryType.Offer),
            new Field(Fields.Symbol, 2),
            new Field(Fields.MDEntryType, MDEntryType.MarketBid),
            new Field(Fields.Symbol, 3),
            new Field(Fields.MDEntryType, MDEntryType.MarketOffer),
            new Field(Fields.Symbol, 4),
            new Field(Fields.MDEntryType, MDEntryType.TradeVolume),
            new Field(Fields.Symbol, 5),
            new Field(Fields.NoQuoteSets, 3),
            new Field(Fields.QuoteSetID, 1),
            new Field(Fields.UnderlyingSymbol, 'EUR/USD'),
            new Field(Fields.QuoteSetValidUntilTime, '20090323-15:40:29'),
            new Field(Fields.TotNoQuoteEntries, 1),
            new Field(Fields.LastFragment, 0),
            new Field(Fields.NoQuoteEntries, 3),
            new Field(Fields.QuoteEntryID, 1),
            new Field(Fields.BidSize, 100),
            new Field(Fields.QuoteSetID, 2),
            new Field(Fields.UnderlyingSymbol, 'USD/EUR'),
            new Field(Fields.QuoteSetValidUntilTime, '20090323-15:40:29'),
            new Field(Fields.TotNoQuoteEntries, 1),
            new Field(Fields.LastFragment, 0),
            new Field(Fields.NoQuoteEntries, 3),
            new Field(Fields.QuoteEntryID, 1),
            new Field(Fields.BidSize, 200),
        ];
        const newMessage: Message = new Message(fixVersion, ...fields);
        const encoded: string = newMessage.encode();
        const message: Message = fixParser.parse(encoded)[0];

        expect(message.getGroupAsArray(Fields.NoQuoteSets)).toEqual([
            {
                BidSize: 100,
                LastFragment: '0',
                NoQuoteEntries: 3,
                QuoteEntryID: '1',
                QuoteSetID: '1',
                QuoteSetValidUntilTime: '20090323-15:40:29',
                TotNoQuoteEntries: 1,
                UnderlyingSymbol: 'EUR/USD',
            },
            {
                BidSize: 200,
                LastFragment: '0',
                NoQuoteEntries: 3,
                QuoteEntryID: '1',
                QuoteSetID: '2',
                QuoteSetValidUntilTime: '20090323-15:40:29',
                TotNoQuoteEntries: 1,
                UnderlyingSymbol: 'USD/EUR',
            },
        ]);
    });
});
