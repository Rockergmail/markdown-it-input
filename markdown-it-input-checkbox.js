/*! markdown-it-ins 2.0.0 https://github.com//markdown-it/markdown-it-ins @license MIT */(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitIns = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function checkbox_plugin(md) {
  var ch, token, content, pos;

  function tokenize(state, silent) {
    var i, scanned, token, len, ch,
        start = state.pos,
        marker = state.src.charCodeAt(start);

      if (silent) { return false; }

      if (marker !== 0x26/* & */) { return false; }

      scanned = state.scanDelims(state.pos, true);
      // len = scanned.length;
      len = scanned.length;
      ch = String.fromCharCode(marker);

      if (len < 2) { return false; }

      if (len % 2) {
        token         = state.push('text', '', 0);
        token.content = ch;
        len--;
      }

      for (i = 0; i < len; i += 2) {
        token         = state.push('text', '', 0);
        token.content = ch + ch;

        state.delimiters.push({
          marker: marker,
          jump:   i,
          token:  state.tokens.length - 1,
          level:  state.level,
          end:    -1,
          open:   scanned.can_open,
          close:  scanned.can_close
        });
      }

      state.pos += scanned.length;

      return true;
  }
  
  function postProcess(state) {
    var i, j,
        startDelim,
        endDelim,
        token,
        loneMarkers = [],
        delimiters = state.delimiters,
        max = state.delimiters.length;

    for (i = 0; i < max; i++) {
      startDelim = delimiters[i];

      if (startDelim.marker !== 0x26/* & */) {
        continue;
      }

      if (startDelim.end === -1) {
        continue;
      }

      endDelim = delimiters[startDelim.end];

      token         = state.tokens[startDelim.token];
      token.mcq     = 0;
      token.type    = 'checkbox_open';
      token.tag     = 'label><input';
      token.attrs   = [ ['type', 'checkbox'], ['name', 'mcq'+(token.mcq++)] ];
      token.nesting = 1;
      token.markup  = '&&';
      token.content = '';

      token         = state.tokens[endDelim.token];
      token.type    = 'checkbox_close';
      token.tag     = 'input></label';
      token.nesting = -1;
      token.markup  = '&&';
      token.content = '';

      if (state.tokens[endDelim.token - 1].type === 'text' &&
          state.tokens[endDelim.token - 1].content === '&') {

        loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's splitted
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    //
    // So, we have to move all those markers after subsequent s_close tags.
    //
    while (loneMarkers.length) {
      i = loneMarkers.pop();
      j = i + 1;

      while (j < state.tokens.length && state.tokens[j].type === 'checkbox_close') {
        j++;
      }

      j--;

      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  }

  md.inline.ruler.before('emphasis', 'input', tokenize);
  md.inline.ruler2.before('emphasis', 'input', postProcess);

};

},{}]},{},[1])(1)
});