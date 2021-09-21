import {
    Application,
    HttpRequest,
    HttpResponse,
    RequestMethod,
} from "https://deno.land/x/dragon@v1.1.6/lib/mod.ts";

const app = new Application();

const r = app.routes();

r.withPath("/hello")
    .withMethods(RequestMethod.GET)
    .handleFunc(
        async function (Request: HttpRequest, ResponseWriter: HttpResponse) {
            ResponseWriter.end("Hello Dragon");
        },
    );

r.withPath("/demo")
    .handleFunc(
        async function (Request: HttpRequest, ResponseWriter: HttpResponse) {
            ResponseWriter.end("Hello Dragon Demo");
        },
    );

app.listenAndServe({ port: 80 });

console.log("🐉 Serveur listining");
