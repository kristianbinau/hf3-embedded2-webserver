import {
    Application,
    HttpRequest,
    HttpResponse,
    RequestMethod,
} from "https://deno.land/x/dragon@v1.1.6/lib/mod.ts";
import { WebSocketClient, WebSocketServer } from "https://deno.land/x/websocket@v0.1.3/mod.ts";
import { Client } from "https://deno.land/x/mysql/mod.ts";

const client = await new Client().connect({
    hostname: "127.0.0.1",
    username: "root",
    password: "root",
    db: "hf3-embedded-webserver-test",
});

let wsClient: WebSocketClient;

const app = new Application();

const r = app.routes();

r.withPath("/hello")
    .withMethods(RequestMethod.GET)
    .handleFunc(
        async function (Request: HttpRequest, ResponseWriter: HttpResponse) {
            ResponseWriter.end("Hello Dragon");
        },
    );

r.withPath(/temp\/(?<temp>[0-9]+\.?[0-9]*|\.[0-9]+)/u)
    .withMethods(RequestMethod.GET)
    .handleFunc(
        async function (Request: HttpRequest, ResponseWriter: HttpResponse) {
            const { temp: temperature } = Request.params();
            const temp = temperature as unknown as number

            let result = await client.execute(`INSERT INTO data(data_name, value) values(?,?)`, [
                "temp",
                1000 * temp,
            ]);
            ResponseWriter.end("");
        },
    );

r.withPath(/send\/(?<message>([A-z])\w+)/u)
    .withMethods(RequestMethod.GET)
    .handleFunc(
        async function (Request: HttpRequest, ResponseWriter: HttpResponse) {
            const { message: msg } = Request.params();

            if (wsClient !== undefined) {
                wsClient.send(msg)
                wsClient.on("message", function (message: string) {
                    ResponseWriter.end("Send: " + msg + " Received: " + message);
                });
            }
            else {
                ResponseWriter.end("Couldn't send " + msg);
            }
        },
    );

const wss = new WebSocketServer(8080);
wss.on("connection", function (ws: WebSocketClient) {
    console.log("Connected")
    wsClient = ws;
});

app.listenAndServe({ port: 8000, hostname: "10.130.68.182" });

console.log("🐉 Serveur listining");
