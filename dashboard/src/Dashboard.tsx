import { Fragment, useState, ChangeEvent } from 'react';

import { FIXParser, Message } from 'fixparser/FIXParserBrowser';
import { MessageList } from './messages/MessageList';
import { MessageDetailList } from './messages/MessageDetailList';
import { testMessages } from '../../test/test-messages';

export const getValue = (obj: any, field: any = 'value') => (obj && obj[field] ? obj[field] : null);

export function Dashboard(): JSX.Element {
    const fixParser: FIXParser = new FIXParser();
    const fixString: string =
        '8=FIX.4.19=6135=A34=149=EXEC52=20121105-23:24:0656=BANZAI98=0108=3010=0038=FIX.4.19=6135=A34=149=BANZAI52=20121105-23:24:0656=EXEC98=0108=3010=0038=FIX.4.19=4935=034=249=BANZAI52=20121105-23:24:3756=EXEC10=2288=FIX.4.19=4935=034=249=EXEC52=20121105-23:24:3756=BANZAI10=2288=FIX.4.19=10335=D34=349=BANZAI52=20121105-23:24:4256=EXEC11=135215788257721=138=1000040=154=155=MSFT59=010=0628=FIX.4.19=13935=834=349=EXEC52=20121105-23:24:4256=BANZAI6=011=135215788257714=017=120=031=032=037=138=1000039=054=155=MSFT150=2151=010=0598=FIX.4.19=15335=834=449=EXEC52=20121105-23:24:4256=BANZAI6=12.311=135215788257714=1000017=220=031=12.332=1000037=238=1000039=254=155=MSFT150=2151=010=2308=FIX.4.19=10335=D34=449=BANZAI52=20121105-23:24:5556=EXEC11=135215789503221=138=1000040=154=155=ORCL59=010=0478=FIX.4.19=13935=834=549=EXEC52=20121105-23:24:5556=BANZAI6=011=135215789503214=017=320=031=032=037=338=1000039=054=155=ORCL150=2151=010=0498=FIX.4.19=15335=834=649=EXEC52=20121105-23:24:5556=BANZAI6=12.311=135215789503214=1000017=420=031=12.332=1000037=438=1000039=254=155=ORCL150=2151=010=2208=FIX.4.19=10835=D34=549=BANZAI52=20121105-23:25:1256=EXEC11=135215791235721=138=1000040=244=1054=155=SPY59=010=0038=FIX.4.19=13835=834=749=EXEC52=20121105-23:25:1256=BANZAI6=011=135215791235714=017=520=031=032=037=538=1000039=054=155=SPY150=2151=010=2528=FIX.4.19=10435=F34=649=BANZAI52=20121105-23:25:1656=EXEC11=135215791643738=1000041=135215791235754=155=SPY10=1988=FIX.4.19=8235=334=849=EXEC52=20121105-23:25:1656=BANZAI45=658=Unsupported message type10=0008=FIX.4.19=10435=F34=749=BANZAI52=20121105-23:25:2556=EXEC11=135215792530938=1000041=135215791235754=155=SPY10=1978=FIX.4.19=8235=334=949=EXEC52=20121105-23:25:2556=BANZAI45=758=Unsupported message type10=002';

    const [value, setValue] = useState(fixString);
    const [messages, setMessages] = useState<Message[]>(fixParser.parse(value));
    const [selectedMessage, setSelectedMessage] = useState<Message>(messages[0]);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const messages = fixParser.parse(event.target.value);
        setValue(event.target.value);
        setMessages(messages);
        setSelectedMessage(messages[0]);
        setSelectedValue(event.target.value);
    };

    const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        const messages = fixParser.parse(event.target.value);
        setValue(event.target.value);
        setMessages(messages);
        setSelectedMessage(messages[0]);
        setSelectedValue(null);
    };

    const selectMessage = (message: Message): void => {
        setSelectedMessage(message);
    };

    const exampleMessages = (): JSX.Element[] => {
        return testMessages.map((message, key) => (
            <option key={`option_${key}`} value={message.fix}>
                {message.description} {message.detail}
            </option>
        ));
    };

    return (
        <Fragment>
            <div>
                <div className="uk-section  uk-section-primary uk-section-small uk-light">
                    <div className="uk-container">
                        <h3>
                            FIXParser is{' '}
                            <a href="https://gitlab.com/logotype/fixparser" className="uk-link-muted">
                                open-source
                            </a>{' '}
                            at GitLab
                        </h3>
                        <div className="uk-alert-warning" data-uk-alert="">
                            <a className="uk-alert-close" data-uk-close="" />
                            <h3 className="enterprise-header">FIXParser Enterprise version</h3>
                            <p>
                                FIXParser empowers fintech applications. A lot of time and effort has been spent in
                                building this library. If this library helps your business and if you'd like to help
                                support the future of the project, please consider purchasing FIXParser Enterprise.
                            </p>
                            <a className="enterprise-link" href="https://fixparser.io">
                                Purchase FIXParser Enterprise
                            </a>
                        </div>
                        <p className="uk-margin-remove">
                            This is the TypeScript library for working with FIX protocol messages. Compliant with FIX
                            5.0 SP2.
                        </p>
                        <select
                            className="uk-select uk-margin-top uk-margin-bottom uk-dark"
                            onChange={handleSelectChange}
                            value={selectedValue!}
                        >
                            <option value="">Select example FIX message</option>
                            {exampleMessages()}
                        </select>
                        <textarea className="uk-textarea" rows={3} onChange={handleTextareaChange} value={value} />
                    </div>
                </div>
                <div className="uk-section uk-section-default small-fonts">
                    <div className="uk-container">
                        <div className="uk-grid-large uk-child-width-expand@s" uk-grid="true">
                            <MessageList
                                messages={messages}
                                selectedMessage={selectedMessage}
                                onSelectMessage={selectMessage}
                            />
                            <MessageDetailList parser={fixParser} message={selectedMessage} />
                        </div>
                    </div>
                </div>
                <div className="uk-section uk-section-secondary uk-light">
                    <div className="uk-container">
                        <h3>
                            FIXParser is{' '}
                            <a href="https://gitlab.com/logotype/fixparser" className="uk-link-muted">
                                open-source
                            </a>{' '}
                            at GitLab
                        </h3>
                        <p>Copyright © 2021 logotype</p>
                        <p>
                            Permission is hereby granted, free of charge, to any person obtaining a copy of this
                            software and associated documentation files (the &quot;Software&quot;), to deal in the
                            Software without restriction, including without limitation the rights to use, copy, modify,
                            merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
                            persons to whom the Software is furnished to do so, subject to the following conditions: The
                            above copyright notice and this permission notice shall be included in all copies or
                            substantial portions of the Software.
                            <br />
                            <br />
                            THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                            PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
                            BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT
                            OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
                            DEALINGS IN THE SOFTWARE.
                        </p>
                        <p>
                            Version: {process.env.__PACKAGE_VERSION__} built at {process.env.__BUILD_TIME__}.
                        </p>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
