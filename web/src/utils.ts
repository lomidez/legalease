// This Response["body"] instead of a ReadableStream<Uint8Array> is because
// sendChatMessage returns the body directly, so just matching the type
// since this is used in Chatbot.tsx
export async function* parseSSEStream(
  stream: Response["body"],
): AsyncGenerator<string> {
  if (stream) {
    const reader = stream
      .pipeThrough(new TextDecoderStream())
      .getReader()

    while (true) {
      const { value, done } = await reader.read();
      if (done) break

      for (let line of value.split('\n\n')) {
        // remove "data: "
        line = line.slice(6)
        try {
          let parsedString = line.replace(/"/g, '').replace(/\\n/g, '\n').replace("\u2013", '-')
          if (parsedString.endsWith("</s>")) {
            parsedString = parsedString.substring(0, parsedString.length - 4);
          }
          yield parsedString
        } catch (e) {
          console.error("Error parsing server response:", e)
        }
      }
    }
  }
}

// I can't get the SSE version to work
// The above is discount SSE

//import { EventSourceParserStream } from "eventsource-parser/stream";
//import { EventSourceMessage } from "./types/sse.ts";

//export async function* parseSSEStream(
//  stream: Response["body"],
//): AsyncGenerator<string> {
//  if (stream) {
//    const sseStream = stream
//      .pipeThrough(new TextDecoderStream())
//      .pipeThrough(new EventSourceParserStream())
//
//    for await (const chunk of sseStream) {
//      if (chunk.type === "event") {
//        yield chunk.data;
//      }
//    }
//  }
//}

