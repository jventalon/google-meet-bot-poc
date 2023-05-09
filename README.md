# Google Meet bot POC

POC to use [Puppeteer](https://pptr.dev/) to automatically connect to a Google Meet and record the audio from the conversation.

## Goals

- Being able to automatically connect to a Google Meet 
- Being able to record audio from the conversation

## Installation

Run `npm install`.

## Usage

Setup the config info (meeting url, email and password of the Google account to use) in index.js.
Make sure the Google account doesn't have 2-step authentication enabled. To disble it, got to: https://myaccount.google.com/security

Run `npm run start`.