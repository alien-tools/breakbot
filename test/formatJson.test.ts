import payloadv2 from "./fixtures/maracas.v2.json";
import payloadv3 from "./fixtures/maracas.v3.json";
import payloadv4 from "./fixtures/maracas.v4.json";
import payloadv5 from "./fixtures/maracas.v5.json";

import { parseJson } from "../src/formatJson";

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

export const V4title = readFileSync(path.join(__dirname, "/fixtures/reports/V4-title.md"), "utf-8");
export const V4summary = readFileSync(path.join(__dirname, "/fixtures/reports/V4-summary.md"), "utf-8");
export const V4message = readFileSync(path.join(__dirname, "/fixtures/reports/V4-message.md"), "utf-8");

export const V5title = readFileSync(path.join(__dirname, "/fixtures/reports/V5-title.md"), "utf-8");
export const V5summary = readFileSync(path.join(__dirname, "/fixtures/reports/V5-summary.md"), "utf-8");
export const V5message = readFileSync(path.join(__dirname, "/fixtures/reports/V5-message.md"), "utf-8");

describe("Checks that the Json received from Maracas is correctly parsed", () => {
    test("parsing the new Json, with 1 client in error", async (done) => {
        const myReport = parseJson(payloadv2, 10, 10, 10)

        const mockReportv2 = [
            V2title,
            V2summary,
            V2message
        ]

        done(expect(myReport).toStrictEqual(mockReportv2))
    })

    test("parsing the new Json, with 1 client", async (done) => {
        const myReport = parseJson(payloadv3, 10, 10, 10)

        const mockReportv3 = [
            V3title,
            V3summary,
            V3message
        ]

        done(expect(myReport).toStrictEqual(mockReportv3))
    })

    test("parsing the new Json, with several clients", async (done) => {
        const myReport = parseJson(payloadv4, 10, 10, 10)

        const mockReportv4 = [
            V4title,
            V4summary,
            V4message
        ]

        done(expect(myReport).toStrictEqual(mockReportv4))
    })

    test("parsing the new Json, with no clients", async (done) => {
        const myReport = parseJson(payloadv5, 10, 10, 10)

        const mockReportv5 = [
            V5title,
            V5summary,
            V5message
        ]

        done(expect(myReport).toStrictEqual(mockReportv5))
    })
})