/* @flow */

const utils = require('../utils');

type commonXDRObject = {data: Object, callback: Function, success: Function, fail: Function};


export default class {

  xdr: Function;
  subscribeKey: string;
  publishKey: string;

  maxHostNumber: number;
  currentOrigin: number;

  origin: string;

  constructor(xdr: Function,
              subscribeKey: string,
              publishKey: string,
              ssl: boolean = false,
              origin: string = 'pubsub.pubnub.com'
              ) {
    this.xdr = xdr;
    this.subscribeKey = subscribeKey;
    this.publishKey = publishKey;

    this.maxHostNumber = 20;
    this.currentOrigin = Math.floor(Math.random() * this.maxHostNumber);

    this.origin = (ssl ? 'https://' : 'http://') + origin;
  }


  nextOrigin(failover: boolean): string {
    // if a custom origin is supplied, use do not bother with shuffling subdomains
    if (this.origin.indexOf('pubsub.') === -1) {
      return this.origin;
    }

    let newSubdomain: string;

    if (failover) {
      newSubdomain = utils.generateUUID().split('-')[0];
    } else {
      this.currentOrigin = this.currentOrigin + 1;

      if (this.currentOrigin >= this.maxHostNumber) { this.currentOrigin = 1; }

      newSubdomain = this.currentOrigin.toString();
    }

    return this.origin.replace('pubsub', 'ps' + newSubdomain);
  }

  // method based URL's
  fetchHistory(STD_ORIGIN: string, channel: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      STD_ORIGIN, 'v2', 'history', 'sub-key', this.getSubscribeKey(), 'channel', utils.encode(channel)
    ];

    this.xdr({ data, callback, success, fail, url });
  }

  fetchReplay(STD_ORIGIN: string, source: string, destination: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      STD_ORIGIN, 'v1', 'replay', this.getPublishKey(), this.getSubscribeKey(), source, destination
    ];

    this.xdr({ data, callback, success, fail, url });
  }

  fetchTime(STD_ORIGIN: string, jsonp: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      STD_ORIGIN, 'time', jsonp
    ];

    this.xdr({ data, callback, success, fail, url });
  }

  // getters
  getSubscribeKey(): string {
    return this.subscribeKey;
  }

  getPublishKey(): string {
    return this.publishKey;
  }
}
