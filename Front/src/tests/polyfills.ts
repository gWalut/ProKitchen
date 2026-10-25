import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';
import { BroadcastChannel } from 'worker_threads';
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.BroadcastChannel = BroadcastChannel as any;
global.ReadableStream = ReadableStream as any;
global.WritableStream = WritableStream as any;
global.TransformStream = TransformStream as any;

if (typeof global.Request === 'undefined') {
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
    global.fetch = fetch;
}
