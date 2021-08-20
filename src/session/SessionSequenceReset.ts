/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { log } from '../util/util';

export const handleSequenceReset = (parser: IFIXParser, message: Message): void => {
    const newSeqNo = message.getField(FieldEnum.NewSeqNo)!.value;
    if (newSeqNo) {
        log(`${parser.parserName} (${parser.protocol!.toUpperCase()}): -- New sequence number ${newSeqNo}`);
        if (parser.parserName === 'FIXServer') {
            parser.setNextTargetMsgSeqNum(newSeqNo);
        } else {
            parser.nextNumIn = Number(newSeqNo);
        }
    }
};
