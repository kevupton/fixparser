/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { logWarning } from '../util/util';

export const handleSequence = (parser: IFIXParser, message: Message): boolean => {
    if (message.messageSequence !== parser.nextNumIn) {
        logWarning(
            `FIXServer (${parser.protocol!.toUpperCase()}): Expected MsgSeqNum ${parser.nextNumIn}, but got ${
                message.messageSequence
            }`,
        );
        return false;
    }
    return true;
};
