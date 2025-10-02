
const monthMap = {
    "jan": 0,
    "feb": 1,
    "mar": 2,
    "apr": 3,

    "may": 4,
    "jun": 5,
    "jul": 6,
    "aug": 7,
    
    "sep": 8,
    "oct": 9,
    "nov": 10,
    "dec": 11,
}

function getLevelColour(level) {
    if (level <= 10) return "#7e7e8f"
    else if (level <= 20) return "#4b5bab"
    else if (level <= 30) return "#4da6ff"
    else if (level <= 40) return "#3ca370"
    else if (level <= 50) return "#8fde5d"
    else if (level <= 60) return "#cfff70"
    else if (level <= 70) return "#ffe478"
    else if (level <= 80) return "#f2a65e"
    else if (level <= 90) return "#eb564b"
    else return "#f33175"
}

const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const pfpColorCombinations = [
    ["2", "90deg"],
    ["4", "347deg"],
    ["2", "290deg"],
    ["2", "60deg"],
    ["2", "9deg"],
    ["2", "81deg"],
    ["2", "124deg"],
    ["1", "240deg"],
    ["1.5", "314deg"],
    ["2", "328deg"],
    ["1", "0deg"],
]

function getLevel(memberEntry) {
    let yearDiff = new Date().getFullYear() - parseInt(memberEntry["joined"].split(" ")[1]);
    let monthDiff = new Date().getMonth() - monthMap[memberEntry["joined"].split(" ")[0].toLowerCase()];
    let level = 12 * yearDiff + monthDiff;
    return level;
}

function renderMember(memberEntry, targetElement) {
    let level = getLevel(memberEntry);

    let fgGameColor = memberEntry["kind"] == "Executive" ? "#473b78" : "#641a34";
    fgGameColor = memberEntry["kind"] == "Past Executive" ? "#322947" : fgGameColor;

    let bgColor = memberEntry["kind"] == "Executive" ? "#4da6ff" : "#b0305c";
    bgColor = memberEntry["kind"] == "Past Executive" ? "#4b5bab" : bgColor;

    let html = document.createElement('div');
    html.classList = ["person2"];
    html.innerHTML = `<div class="top">
        <div class="before-img">
            <img src="/images/members/default${((cyrb53(memberEntry["alias"]) + cyrb53(memberEntry["kind"])) % 27) + 1}.png">
        </div>
        <div class="info">
            <div class="banner anchor" id="${memberEntry["alias"]}" style="background-color: ${bgColor}">
                <span class="role">${memberEntry["kind"]}</span>
                <span class="fav-game" style="color: ${fgGameColor}">(${memberEntry["fav-game"]})</span>
            </div>
            <p class="details">
                <span class="left">
                    <a class="alias link2" href="${memberEntry["link"]}">${memberEntry["alias"]}</a>
                    <span class="name">(${memberEntry["name"]})</span> <br>
                    <span class="discord-handle">${memberEntry["discord"]}</span>
                </span>
                <span class="right">
                    <span class="level" style="color: ${getLevelColour(level)}">Level ${level}</span>
                    <span class="date-joined">Joined ${memberEntry["joined"]}</span>
                </span>
            </p>
        </div>
    </div>
    <p class="blurb">
        ${memberEntry["blurb"]}
    </p>`;

    let divElement = html.children[0].children[0];

    var xDeg = 0;
    var yDeg = 0;
    divElement.addEventListener("pointermove", (event) => {
        let elementXPos = html.children[0].children[0].getBoundingClientRect().left;
        let elementYPos = html.children[0].children[0].getBoundingClientRect().top;

        let relativeX = event.clientX - elementXPos - divElement.children[0].offsetWidth/2;
        let relativeY = event.clientY - elementYPos - divElement.children[0].offsetHeight/2;
      
        let newXDeg = -relativeX * 0.15;
        let newYDeg = -relativeY * 0.15;

        xDeg = (5*xDeg + newXDeg) / 6;
        yDeg = (5*yDeg + newYDeg) / 6;

        let brightnessX = 1 - Math.cos(3.1415 / 6) + Math.cos((3.1415 / 6) - (3.1415 * xDeg / 180));
        let brightnessY = 1 - Math.cos(3.1415 / 4) + Math.cos((3.1415 / 4) - (3.1415 * yDeg / 180));

        divElement.children[0].style.transition = `scale 0.5s`;
        divElement.children[0].style.transform = `perspective(100px) translateX(${-xDeg}px) translateY(${-yDeg}px) rotateY(${-xDeg}deg) rotateX(${yDeg}deg)`;
        divElement.children[0].style.filter = `brightness(${Math.pow((brightnessX + brightnessY) / 2, 2)})`;
        divElement.children[0].style.scale = `1.2`;
    });
    divElement.addEventListener("pointerleave", (event) => {
        xDeg = 0;
        yDeg = 0;
        divElement.children[0].style.transition = `scale 0.5s, transform 0.5s, filter 0.5s`;
        divElement.children[0].style.transform = `perspective(200px) rotateY(0deg) rotateX(0deg)`;
        divElement.children[0].style.filter = `brightness(1.0)`;
        divElement.children[0].style.scale = `1.0`;
    })
    targetElement.appendChild(html);
}

function addMemberSmall(memberEntry, targetElement) {
    let teaserBlurb = memberEntry["blurb"].split(" ").length > 15
                    ? (memberEntry["blurb"].split(" ").slice(0, 15).join(" ") + "...")
                    : memberEntry["blurb"];
    let html = `
        <li style="margin-bottom: 10px; word-wrap: break-word;">
            <a style="color: #ffe478;" href="/members#${memberEntry["alias"]}">${memberEntry["alias"]}</a>
            -- ${teaserBlurb}
        </li>
    `;
    targetElement.innerHTML += html;
}

export async function onMembersPage() {
    let response = await fetch("/data/members.json");
    let json = await response.json();
    
    // sort by name
    json["members"].sort((a, b) => {
        return a["alias"] < b["alias"] ? -1 : 1;
    }).forEach(memberEntry => {
        renderMember(memberEntry, document.getElementById("member-list"))
    });

    // this is actually important for the webpage to move to hash links
    if (location.href.split("#").length > 1)
        location.href = location.href;
}

export async function onMainPage() {
    let response = await fetch("/data/members.json");
    let json = await response.json();
    
    // sort by name
    let numMembers = json["members"].length;
    let addedMembers = [];
    while (addedMembers.length < 3) {
        let rand = Math.floor(Math.random() * numMembers);
        if (addedMembers.includes(rand)) {
            continue
        } else {
            addMemberSmall(json["members"][rand], document.getElementById("lovely-people"));
            addedMembers.push(rand);
        }
    }
}