/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
export enum ExecTypeEnum {
    New = '0',
    PartialFill = '1',
    Fill = '2',
    DoneForDay = '3',
    Canceled = '4',
    Replaced = '5',
    PendingCancel = '6',
    Stopped = '7',
    Rejected = '8',
    Suspended = '9',
    PendingNew = 'A',
    Calculated = 'B',
    Expired = 'C',
    Restated = 'D',
    PendingReplace = 'E',
    Trade = 'F',
    TradeCorrect = 'G',
    TradeCancel = 'H',
    OrderStatus = 'I',
    TradeInClearing = 'J',
    TradeReleasedClearing = 'K',
    TriggeredBySystem = 'L',
    Locked = 'M',
    Released = 'N',
}
