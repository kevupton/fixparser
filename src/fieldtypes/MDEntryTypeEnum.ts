/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
export enum MDEntryTypeEnum {
    Bid = '0',
    Offer = '1',
    Trade = '2',
    IndexValue = '3',
    OpeningPrice = '4',
    ClosingPrice = '5',
    SettlementPrice = '6',
    TradingSessionHighPrice = '7',
    TradingSessionLowPrice = '8',
    TradingSessionVWAPPrice = '9',
    Imbalance = 'A',
    TradeVolume = 'B',
    OpenInterest = 'C',
    CompositeUnderlyingPrice = 'D',
    SimulatedSellPrice = 'E',
    SimulatedBuyPrice = 'F',
    MarginRate = 'G',
    MidPrice = 'H',
    EmptyBook = 'J',
    SettleHighPrice = 'K',
    SettleLowPrice = 'L',
    PriorSettlePrice = 'M',
    SessionHighBid = 'N',
    SessionLowOffer = 'O',
    EarlyPrices = 'P',
    AuctionClearingPrice = 'Q',
    SwapValueFactor = 'S',
    DailyValueAdjustmentLongPosition = 'R',
    CumulativeValueAdjustmentLongPosition = 'T',
    DailyValueAdjustmentShortPosition = 'U',
    CumulativeValueAdjustmentShortPosition = 'V',
    FixingPrice = 'W',
    CashRate = 'X',
    RecoveryRate = 'Y',
    RecoveryRateLongPosition = 'Z',
    RecoveryRateShortPosition = 'a',
    MarketBid = 'b',
    MarketOffer = 'c',
    ShortSaleMinPrice = 'd',
    PreviousClosingPrice = 'e',
}
