/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Message } from './../message/Message';

export const MAX_BUFFER: number = 2500;

export class MessageBuffer {
    private buffer: Message[] = [];

    public add(message: Message): void {
        if (this.buffer.length === MAX_BUFFER) {
            this.buffer.pop();
        }
        this.buffer.unshift(message);
    }

    public getByMsgSequence(msgSequence: number): Message | null {
        const index: number = this.buffer.findIndex((message) => message.messageSequence === msgSequence);
        if (index > -1) {
            return this.buffer[index];
        } else {
            return null;
        }
    }

    public size(): number {
        return this.buffer.length;
    }

    public clear(): void {
        this.buffer = [];
    }
}
