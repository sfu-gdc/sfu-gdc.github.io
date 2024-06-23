
function renderMember(memberEntry) {
    let fgGameColor = memberEntry["kind"] == "Executive" ? "#473b78" : "#641a34";
    fgGameColor = memberEntry["kind"] == "Past Executive" ? "#322947" : fgGameColor;

    let bgColor = memberEntry["kind"] == "Executive" ? "#4da6ff" : "#b0305c";
    bgColor = memberEntry["kind"] == "Past Executive" ? "#4b5bab" : bgColor;

    let html = `<div class="person">
        <div class="kind" style="background-color: ${bgColor}">
            <span>${memberEntry["kind"]}</span>
            <span class="fav-game" style="color: ${fgGameColor}">(${memberEntry["fav-game"]})</span>
        </div>
        <p class="details">
            <span>
                <a class="alias link2" href="${memberEntry["link"]}">${memberEntry["alias"]}</a>
                <span class="name">(${memberEntry["name"]})</span>
                <span class="discord-handle">${memberEntry["discord"]}</span>
            </span>
            <span class="right">
                <span class="date-joined">Joined ${memberEntry["joined"]}</span>
            </span>
        </p>
        <p class="blurb">
            ${memberEntry["blurb"]}
        </p>
    </div>`;

    document.getElementById("member-list").innerHTML += html;
}

let response = await fetch("/data/members.json");
let json = await response.json();

// sort by name
json["members"].sort((a, b) => {
    a["alias"] > b["alias"]
});
json["members"].forEach(memberEntry => {
    renderMember(memberEntry)
});
