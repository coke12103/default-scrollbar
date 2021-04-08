// ==UserScript==
// @name        Default scrollbar
// @namespace   https://github.com/coke12103/default-scrollbar
// @description Fix the sites that try to change your scrollbar by deleting the scrollbar CSS rules every few seconds
// @version     1.0.0
// @license     MIT
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @include     *
// @run-at      document-end
// @author      coke12103
// ==/UserScript==

const failedSheets = {};

function getBackToDefaultScrollbars() {
  // https://superuser.com/questions/380629/is-there-a-way-to-disable-custom-webkit-scrollbars/1585452#1585452

  // 実行可能なドメインのリストになければパス
  if(!GM_getValue('domainList', []).some(el => el == location.hostname)) return;

  for(var sheet of [...document.styleSheets]){
    if(failedSheets[sheet.href]) continue;

    try{
      var ruleSet = sheet.rules || sheet.cssRules;

      for(var i = 0; i < ruleSet.length; ++i) {
        var rule = ruleSet[i];
        if (!rule.selectorText) continue;

        if (rule.selectorText.indexOf("::-webkit-scrollbar") >= 0) {
            console.log("deleting scrollbar css rule at", sheet.href);
            console.debug("css rule deleted is", rule);
            sheet.deleteRule(i--);
        }else if(rule.selectorText.indexOf("scrollbar") >= 0){
            // Github has some classes that are called "scrollbar"
            // that if we delete them will break the file edit page.
            // So this section is an attempt to debug similar cases if
            // they arise.
            console.debug("fishy scrollbar selector rule, but not deleting", rule);
        }
      }
    }catch(e){
      console.debug("Can't read the css rules of: " + sheet.href, e);
      failedSheets[sheet.href] = true;
    }
  }
}

function addDomain(){
  if(GM_getValue('domainList', []).some((el) => el == location.hostname)) return;
  GM_setValue('domainList', GM_getValue('domainList', []).concat(location.hostname));
}

function removeDomain(){
  var removed = GM_getValue('domainList', []).filter((val) => val != location.hostname);
  GM_setValue('domainList', removed);
}

GM_registerMenuCommand('このドメインを対象にする', addDomain);
GM_registerMenuCommand('このドメインを対象外にする', removeDomain);

setInterval(getBackToDefaultScrollbars, 2000);
