/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { log } from '../util/util';

export const handleSequenceReset = (parser: IFIXParser, message: Message): void => {
    const newSeqNo: number = message.getField(FieldEnum.NewSeqNo)!.value as number;
    if (newSeqNo && Number.isFinite(newSeqNo)) {
        log(
            `${
                parser.parserName
            } (${parser.protocol!.toUpperCase()}): -- SequenceReset: new sequence number ${newSeqNo}`,
        );
        if (parser.parserName === 'FIXServer') {
            parser.setNextTargetMsgSeqNum(newSeqNo);
        } else {
            parser.nextNumIn = Number(newSeqNo);
        }
    }
};
