// Google Internal Site Search script- By JavaScriptKit.com (http://www.javascriptkit.com)
// For this and over 400+ free scripts, visit JavaScript Kit- http://www.javascriptkit.com/
// This notice must stay intact for use
//Enter domain of site to search.
var domainroot = "genealogy.hingston.org"

function Gsitesearch(curobj) {
    curobj.q.value = "site:" + domainroot + " " + curobj.qfront.value
}