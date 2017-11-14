/*
 * JavaScript Canvas to Blob
 * https://github.com/blueimp/JavaScript-Canvas-to-Blob
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on stackoverflow user Stoive's code snippet:
 * http://stackoverflow.com/q/4998908
 */

/* global atob, Blob, define */
var CanvasPrototype = (<any>window).HTMLCanvasElement &&
                        (<any>window).HTMLCanvasElement.prototype
var hasBlobConstructor = (<any>window).Blob && (function () {
  try {
    return Boolean(new Blob())
  } catch (e) {
    return false
  }
}())
var hasArrayBufferViewSupport = hasBlobConstructor && (<any>window).Uint8Array &&
  (function () {
    try {
      return new Blob([new Uint8Array(100)]).size === 100
    } catch (e) {
      return false
    }
  }())
var BlobBuilder = (<any>window).BlobBuilder || (<any>window).WebKitBlobBuilder ||
                    (<any>window).MozBlobBuilder || (<any>window).MSBlobBuilder
var dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/
var dataURLtoBlob = (hasBlobConstructor || BlobBuilder) && (<any>window).atob &&
  (<any>window).ArrayBuffer && (<any>window).Uint8Array &&
  function (dataURI) {
    var matches,
      mediaType,
      isBase64,
      dataString,
      byteString,
      arrayBuffer,
      intArray,
      i,
      bb
    // Parse the dataURI components as per RFC 2397
    matches = dataURI.match(dataURIPattern)
    if (!matches) {
      throw new Error('invalid data URI')
    }
    // Default to text/plain;charset=US-ASCII
    mediaType = matches[2]
      ? matches[1]
      : 'text/plain' + (matches[3] || ';charset=US-ASCII')
    isBase64 = !!matches[4]
    dataString = dataURI.slice(matches[0].length)
    if (isBase64) {
      // Convert base64 to raw binary data held in a string:
      byteString = atob(dataString)
    } else {
      // Convert base64/URLEncoded data component to raw binary:
      byteString = decodeURIComponent(dataString)
    }
    // Write the bytes of the string to an ArrayBuffer:
    arrayBuffer = new ArrayBuffer(byteString.length)
    intArray = new Uint8Array(arrayBuffer)
    for (i = 0; i < byteString.length; i += 1) {
      intArray[i] = byteString.charCodeAt(i)
    }
    // Write the ArrayBuffer (or ArrayBufferView) to a blob:
    if (hasBlobConstructor) {
      return new Blob(
        [hasArrayBufferViewSupport ? intArray : arrayBuffer],
        {type: mediaType}
      )
    }
    bb = new BlobBuilder()
    bb.append(arrayBuffer)
    return bb.getBlob(mediaType)
  }

if ((<any>window).HTMLCanvasElement && !CanvasPrototype.toBlob) {
  if (CanvasPrototype.mozGetAsFile) {
    CanvasPrototype.toBlob = function (callback, type, quality) {
      if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
        callback(dataURLtoBlob(this.toDataURL(type, quality)))
      } else {
        callback(this.mozGetAsFile('blob', type))
      }
    }
  } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
    CanvasPrototype.toBlob = function (callback, type, quality) {
      callback(dataURLtoBlob(this.toDataURL(type, quality)))
    }
  }
}

export default dataURLtoBlob;