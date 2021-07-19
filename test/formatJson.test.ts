import payloadv1 from "./fixtures/maracas.v1.json";
import payloadv2 from "./fixtures/maracas.v2.json";
import payloadv3 from "./fixtures/maracas.v3.json";
import { parseJsonMain, parseJson } from "../src/formatJson";

import { readFileSync } from "fs";
const path = require("path");

export const V1title = readFileSync(path.join(__dirname, "/fixtures/reports/V1-title.md"), "utf-8");
export const V1summary = readFileSync(path.join(__dirname, "/fixtures/reports/V1-summary.md"), "utf-8");
export const V1message = readFileSync(path.join(__dirname, "/fixtures/reports/V1-message.md"), "utf-8");

export const V2title = readFileSync(path.join(__dirname, "/fixtures/reports/V2-title.md"), "utf-8");
export const V2summary = readFileSync(path.join(__dirname, "/fixtures/reports/V2-summary.md"), "utf-8");
export const V2message = readFileSync(path.join(__dirname, "/fixtures/reports/V2-message.md"), "utf-8");

export const V3title = readFileSync(path.join(__dirname, "/fixtures/reports/V3-title.md"), "utf-8");
export const V3summary = readFileSync(path.join(__dirname, "/fixtures/reports/V3-summary.md"), "utf-8");
export const V3message = readFileSync(path.join(__dirname, "/fixtures/reports/V3-message.md"), "utf-8");

describe("Checks that the Json received from Maracas is correctly parsed", () => {
    test("mainParse, no clients tested", async (done) => {
        const myReport = parseJsonMain(payloadv1, 10)

        const mockReportv1 = [
            V1title,
            V1summary,
            V1message
        ]

        done(expect(myReport).toStrictEqual(mockReportv1))
    })

    test("mainParse, with clients", async (done) => {
        const myReport = parseJsonMain(payloadv2, 10)

        const mockReportv2 = [
            V2title,
            V2summary,
            V2message
        ]

        done(expect(myReport).toStrictEqual(mockReportv2))
    })

    test("parsing the new Json, with clients", async (done) => {
        const myReport = parseJson(payloadv3, 10)

        const mockReportv3 = [
            V3title,
            V3summary,
            V3message
        ]

        done(expect(myReport).toStrictEqual(mockReportv3))
    })
})