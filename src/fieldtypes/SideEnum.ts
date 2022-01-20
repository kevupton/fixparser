/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
export enum SideEnum {
    Buy = '1',
    Sell = '2',
    BuyMinus = '3',
    SellPlus = '4',
    SellShort = '5',
    SellShortExempt = '6',
    Undisclosed = '7',
    Cross = '8',
    CrossShort = '9',
    CrossShortExempt = 'A',
    AsDefined = 'B',
    Opposite = 'C',
    Subscribe = 'D',
    Redeem = 'E',
    Lend = 'F',
    Borrow = 'G',
}
