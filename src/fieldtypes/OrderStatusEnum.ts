/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
export enum OrderStatusEnum {
    New = '0',
    PartiallyFilled = '1',
    Filled = '2',
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
    AcceptedForBidding = 'D',
    PendingReplace = 'E',
}
