import Transport from 'winston-transport';
export declare class NewRelicLogTransport extends Transport {
    private sendLogsToAgent;
    constructor(logToAgentCallback: (log: any, callback: () => void) => void);
    close(): void;
    log(info: any, callback: () => void): void;
}
//# sourceMappingURL=NewRelicLogTransport.d.ts.map