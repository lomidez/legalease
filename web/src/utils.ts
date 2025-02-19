import { EventSourceParserStream } from "eventsource-parser/stream";
import { EventSourceMessage } from "./types/sse.ts";

// This Response["body"] instead of a ReadableStream<Uint8Array> is because
// sendChatMessage returns the body directly, so just matching the type
// since this is used in Chatbot.tsx
export async function* parseSSEStream(
  stream: Response["body"],
): AsyncGenerator<string> {
  if (stream) {
    const sseStream: AsyncIterable<EventSourceMessage> = stream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream()) as unknown as AsyncIterable<
        EventSourceMessage
      >;

    for await (const chunk of sseStream) {
      if (chunk.type === "event") {
        yield chunk.data;
      }
    }
  }
}
