import { withLogger } from '.';

const log = withLogger('label');

let count = 0;
let target = 2000;

function doDelayedWrite() {
    setTimeout(() => {
        log.info(`count: ${++count}`);
        if (count < target) {
            doDelayedWrite();
        }
    }, 100);
}

doDelayedWrite();
// setTimeout(() => {
//     for(let x = 0; x < 1; x++) {
//         newrelic.startWebTransaction('somewhere', () => {
//             log.warn(`log ${x}`);

//         })
//     }
// }, 1_000);

// const compressor = zlib.createGzip();

// const output = fs.createWriteStream('x.gz');
// compressor.pipe(output);
// for(let i = 0; i < 100; i++) {
//     compressor.write(`${i}`)
// }
// compressor.flush();