import Transport from 'winston-transport';

export class NewRelicLogTransport extends Transport {
    private sendLogsToAgent: (log: any, callback: () => void) => void;

    constructor(logToAgentCallback: (log: any, callback: () => void) => void) {
        super()
        this.setMaxListeners(Infinity);
        this.sendLogsToAgent = logToAgentCallback;
    }

    close() {
        this.sendLogsToAgent = () => {};
    }

    log(info: any, callback: () => void) {
        this.sendLogsToAgent(info, callback);
    }
}

