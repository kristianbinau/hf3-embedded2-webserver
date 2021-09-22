import {
    Application,
    HttpRequest,
    HttpResponse,
    RequestMethod,
} from "https://deno.land/x/dragon@v1.1.6/lib/mod.ts";
import { Client } from "https://deno.land/x/mysql/mod.ts";

const client = await new Client().connect({
    hostname: "127.0.0.1",
    username: "root",
    password: "root",
    db: "hf3-embedded-webserver-test",
});

const app = new Application();

const r = app.routes();

r.withPath("/hello")
    .withMethods(RequestMethod.GET)
    .handleFunc(
        async function (Request: HttpRequest, ResponseWriter: HttpResponse) {
            ResponseWriter.end("Hello Dragon");
        },
    );

r.withPath(/temp\/(?<temp>[0-9]+\.?[0-9]*|\.[0-9]+)/u).withMethods(RequestMethod.GET)
    .handleFunc(
        async function (Request: HttpRequest, ResponseWriter: HttpResponse) {
            const { temp: temperature } = Request.params();
            const temp = temperature as unknown as number

            let result = await client.execute(`INSERT INTO data(data_name, value) values(?,?)`, [
                "temp",
                1000 * temp,
            ]);
        },
    );

app.listenAndServe({ port: 8000, hostname: "10.1.1.200" });

console.log("🐉 Serveur listining");
