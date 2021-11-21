import payloadv1 from "./fixtures/maracas.v1.json";
import payloadv2 from "./fixtures/maracas.v2.json";
import payloadv3 from "./fixtures/maracas.v3.json";
import payloadv4 from "./fixtures/maracas.v4.json";
import payloadv5 from "./fixtures/maracas.v5.json";
import payloadv6 from "./fixtures/maracas.v6.json";

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

export const V6title = readFileSync(path.join(__dirname, "/fixtures/reports/V6-title.md"), "utf-8");
export const V6summary = readFileSync(path.join(__dirname, "/fixtures/reports/V6-summary.md"), "utf-8");
export const V6message = readFileSync(path.join(__dirname, "/fixtures/reports/V6-message.md"), "utf-8");

describe("Checks that the Json received from Maracas is correctly parsed", () => {
    test("parsing the new Json, with a root error", async (done) => {
        const myReport = parseJson(payloadv1, 10, 10, 10)

        const mockReportv1 = [
            V1title,
            V1summary,
            V1message
        ]

        done(expect(myReport).toStrictEqual(mockReportv1))
    })

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

    test("parsing the new Json, with too many BCs and detections", async (done) => {
        const myReport = parseJson(payloadv6, 1, 1, 1)

        const mockReportv6 = [
            V6title,
            V6summary,
            V6message
        ]

        done(expect(myReport).toStrictEqual(mockReportv6))
    })
})