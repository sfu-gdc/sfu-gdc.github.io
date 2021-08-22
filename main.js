
activePage = "frontpage-body";
activeTitle = "title";
function setActive(pageId, titleId) {
    activePage = pageId;
    activeTitle = titleId;
    document.getElementById(pageId).style.display = "block";
    document.getElementById(titleId).classList.add("highlight-box");
}

function setOff(pageId, titleId) {
    document.getElementById(pageId).style.display = "none";
    document.getElementById(titleId).classList.remove("highlight-box");

}

function titleClick() {
    setOff(activePage, activeTitle);
    setActive("frontpage-body", "title");
}

function showcaseClick() {
    setOff(activePage, activeTitle);
    setActive("showcase-body", "showcase");
}

function eventsClick() {
    setOff(activePage, activeTitle);
    setActive("events-body", "events");
}

function linksClick() {
    setOff(activePage, activeTitle);
    setActive("links-body", "links");
}

function contactClick() {
    setOff(activePage, activeTitle);
    setActive("contact-body", "contact");
}