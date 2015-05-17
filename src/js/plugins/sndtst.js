"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var sndtst = Object.create(Plugin);

function _playerStatusReader() {
    var el = $("#jplayer_1"), d = el.data(), status = {};
    if (d.jPlayer) {
        status = {
            title:       d.jPlayer.status.media.title,
            duration:    d.jPlayer.status.duration,
            currentTime: d.jPlayer.status.currentTime,
            paused:      d.jPlayer.status.paused
        };
    }
    el.attr("__status", JSON.stringify(status));
}
function inject(code) {
    var script = document.createElement("script");
    script.appendChild(document.createTextNode(code));
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
}
function parseStatus() {
    var jsonStr = $("#jplayer_1").attr("__status");
    return jsonStr ? JSON.parse(jsonStr) : {};
}

function readTrackMeta() {
    var prefix = "sndtst:";
    return $("meta[property*='" + prefix + "']").toArray()
        .reduce(function(acc, el) {
            el = $(el);
            acc[el.attr("property").replace(prefix, "")] = el.attr("content");
            return acc;
         }, {});
}

sndtst.init("sndtst", "SNDTST");
sndtst.initialize = function() {
    inject(_playerStatusReader.toString() + "; _playerStatusReader();");
};

sndtst.scrape = function () {
    inject("_playerStatusReader();");
    var status = parseStatus(), meta = readTrackMeta();
    if (status.paused) return { artist: null, title: null };

    return {
        artist:   meta.platform + " - " + meta.title,
        album:    meta.title,
        duration: status.duration * 1000,
        elapsed:  status.currentTime * 1000,
        stopped:  status.paused,
        title:    status.title
    };
};

module.exports = sndtst;
