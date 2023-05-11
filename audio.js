import * as fs from 'node:fs';
import {Readable} from 'stream';
import dgram from 'node:dgram';

const file = fs.createWriteStream(process.cwd() + "/test.webm");

async function captureAudio(page) {

    console.log('Starting stream...');
    const stream = await getStream(page, { audio: true, video: false });
	console.log('Recording audio');

	stream.pipe(file);
	setTimeout(async () => {
		await stream.destroy();
		file.close();
		console.log('Recording done');
	}, 1000 * 10);
}

async function getStream(page, opts) {
    if (!opts.audio && !opts.video)
        throw new Error("At least audio or video must be true");
    if (!opts.mimeType) {
        if (opts.video)
            opts.mimeType = "video/webm";
        else if (opts.audio)
            opts.mimeType = "audio/webm";
    }
    if (!opts.frameSize)
        opts.frameSize = 20;
    const extension = await getExtensionPage(page.browser());
    console.log(extension);
    const index = 0;
    const stream = new UDPStream(55200 + index, () => 
    // @ts-ignore
    extension.evaluate((index) => STOP_RECORDING(index), index));
    await page.bringToFront();
    extension.evaluate(
    // @ts-ignore
    (settings) => START_RECORDING(settings), Object.assign(Object.assign({}, opts), { index }));
    return stream;
}

async function getExtensionPage(browser) {
    const extensionTarget = await browser.waitForTarget((target) => {
        return target.type() === "page" && target.url().startsWith('chrome-extension://');
    });
    if (!extensionTarget)
        throw new Error("cannot load extension");
    const videoCaptureExtension = await extensionTarget.page();
    if (!videoCaptureExtension)
        throw new Error("cannot get page of extension");
    return videoCaptureExtension;
}

class UDPStream extends Readable {
    constructor(port = 55200, onDestroy) {
        super({ highWaterMark: 1024 * 1024 * 8 });
        this.onDestroy = onDestroy;
        this.socket = dgram
            .createSocket("udp4", (data) => {
                this.push(data);
            })
            .bind(port, "127.0.0.1", () => { });
        this.resume();
    }
    _read(size) { }
    // @ts-ignore
    async destroy() {
        const _super = Object.create(null, {
            destroy: { get: () => super.destroy }
        });
        await this.onDestroy();
        this.socket.close();
        _super.destroy.call(this);
        return this;
    }
}

export default { captureAudio };