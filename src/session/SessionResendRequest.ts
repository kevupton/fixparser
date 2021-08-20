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
import { log, logWarning } from '../util/util';
import { MAX_BUFFER, MessageBuffer } from '../util/MessageBuffer';
import { Field } from '../fields/Field';

export const handleResendRequest = (parser: IFIXParser, messageBuffer: MessageBuffer, message: Message): void => {
    const from: number | null = message.getField(FieldEnum.BeginSeqNo)
        ? message.getField(FieldEnum.BeginSeqNo)!.value
        : null;
    const to: number | null = message.getField(FieldEnum.EndSeqNo) ? message.getField(FieldEnum.EndSeqNo)!.value : null;

    if (from && to && from < to && from >= 1 && to <= MAX_BUFFER) {
        for (let i: number = from; i <= to; i++) {
            const messageBySequence = messageBuffer.getByMsgSequence(i);
            if (messageBySequence) {
                messageBySequence.addField(new Field(FieldEnum.PossDupFlag, 'Y'));
                messageBySequence.removeFieldByTag(FieldEnum.OrigSendingTime);
                parser.send(messageBySequence);
            } else {
                logWarning(
                    `${
                        parser.parserName
                    } (${parser.protocol!.toUpperCase()}): -- Could not find message with sequence ${i}`,
                );
            }
        }
        log(`${parser.parserName} (${parser.protocol!.toUpperCase()}): >> sent Logon acknowledge`);
    } else {
        logWarning(`${parser.parserName} (${parser.protocol!.toUpperCase()}): -- BeginSeqNo or EndSeqNo out of range`);
    }
};
