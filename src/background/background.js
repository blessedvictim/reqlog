'use strict';
import PouchDB from 'pouchdb';

var db = new PouchDB('history', {adapter: 'idb'});

var browser = browser || chrome

browser.runtime.onInstalled.addListener(function () {
    localStorage.setItem("reqlog1-from", null)
    localStorage.setItem("reqlog1-to", null)
});

function handleMessage(message, sender, sendResponse) {
    console.log("Message from the content script: " + message);
}

chrome.runtime.onMessage.addListener(handleMessage);

// TODO
const reURL = new RegExp("^(https?|chrome):\\/\\/[^\\s$.?#].[^\\s]*$")
const reDomain = new RegExp(/^([0-9a-z-]+\.?)+$/i)


function filterRequest(initiatorURL, targetURL) {
    if (!initiatorURL.match(domainFilter) || !targetURL.match(targetFilter)) {
        return false;
    }

    return true
}

const KB_512 = 1024 * 512

let filter = ["<all_urls>"];

let domainFilter = "tribuna.com"

let targetFilter = "international-api-gateway.trbna.com"

let encoder = new TextDecoder("utf-8");

let hist = [
    // {
    //     _id: "",
    //     requestId: "",
    //     targetURL: "",
    //     headers: [
    //         {name: "", value: ""}
    //     ],
    //     tsStart: new Date(1605962383019.745),
    //     tsEnd: new Date(1605962383019.745),
    //     body: "",
    //     statusCode: 200
    //
    // }
]

function getRequest(id) {
    return hist.find((value) => {
        return value.requestId === id
    })
}


chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        let initiator = details.initiator || ""

        if (filterRequest(initiator, details.url)) {
            let request = {}

            request.requestId = details.requestId;
            request.targetURL = details.url;

            if (details.requestBody && details.requestBody.raw && details.requestBody.raw.length && details.requestBody.raw[0].bytes) {
                let rawData = details.requestBody.raw[0].bytes
                if (rawData.length < KB_512 || rawData.byteLength < KB_512) {
                    request.body = encoder.decode(rawData)
                }
            }

            request.tsStart = new Date(details.timeStamp)
            hist.push(request)
        }
    },
    {
        urls: filter
    },
    ["requestBody", "extraHeaders"]
);

chrome.webRequest.onSendHeaders.addListener(
    function (details) {
        let initiator = details.initiator || ""

        if (filterRequest(initiator, details.url)) {
            let req = getRequest(details.requestId)
            if (req && details.requestHeaders) {
                req.headers = [...details.requestHeaders]
            }
        }
    },
    {
        urls: filter
    },
    ["requestHeaders"]
);

chrome.webRequest.onCompleted.addListener(
    function (details) {
        let initiator = details.initiator || ""

        if (filterRequest(initiator, details.url)) {
            let req = getRequest(details.requestId);

            if (req) {
                req.statusCode = details.statusCode
                req.tsEnd = new Date(details.timeStamp)
                req._id = req.requestId
                db.put(req).then(function (response) {
                    console.log(response);
                }).catch(function (err) {
                    console.log(err);
                });
            }
        }
    },
    {
        urls: filter
    },
    ["responseHeaders"]
);

chrome.webRequest.onErrorOccurred.addListener(
    function (details) {
        let initiator = details.initiator || ""

        if (filterRequest(initiator, details.url)) {
            let req = getRequest(details.requestId)

            if (req) {
                req.statusCode = details.statusCode
                req.tsEnd = new Date(details.timeStamp)
                req._id = req.requestId
                db.put(req).then(function (response) {
                    console.log(response);
                }).catch(function (err) {
                    console.log(err);
                });
            }
        }
    },
    {
        urls: filter
    },
    ["extraHeaders"]
);

console.log("LOL")
