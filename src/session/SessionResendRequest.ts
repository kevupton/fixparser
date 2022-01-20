/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Field } from '../fields/Field';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { MAX_BUFFER, MessageBuffer } from '../util/MessageBuffer';
import { log, logWarning } from '../util/util';

export const handleResendRequest = (parser: IFIXParser, messageBuffer: MessageBuffer, message: Message): void => {
    const from: number | null = message.getField(FieldEnum.BeginSeqNo)
        ? Number(message.getField(FieldEnum.BeginSeqNo)!.value)
        : null;
    let to: number | null = message.getField(FieldEnum.EndSeqNo)
        ? Number(message.getField(FieldEnum.EndSeqNo)!.value)
        : messageBuffer.size();

    if (to === 0) {
        to = messageBuffer.size();
    }

    if (from && from >= 1 && to <= MAX_BUFFER) {
        for (let i: number = from; i <= to; i++) {
            const messageBySequence = messageBuffer.getByMsgSequence(i);
            if (messageBySequence) {
                messageBySequence.removeFieldByTag(FieldEnum.PossDupFlag);
                messageBySequence.addField(new Field(FieldEnum.PossDupFlag, 'Y'));

                if (messageBySequence.getField(FieldEnum.SendingTime)) {
                    const originalSendingTime: string = `${messageBySequence.getField(FieldEnum.SendingTime)!.value}`;
                    messageBySequence.removeFieldByTag(FieldEnum.SendingTime);
                    messageBySequence.addField(new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())));

                    messageBySequence.removeFieldByTag(FieldEnum.OrigSendingTime);
                    messageBySequence.addField(new Field(FieldEnum.OrigSendingTime, originalSendingTime));
                }
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
