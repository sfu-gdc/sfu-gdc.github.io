let resources = [];

function renderResource(resourceEntry) {
    let html = `<div class="resource-card" data-tags="${resourceEntry.tags.join(',')}">
        <a href="${resourceEntry.link}">
            <img src="${resourceEntry.image}" alt="${resourceEntry.title}" class="resource-image">
            <div class="resource-info">
                <h2 class="resource-title">${resourceEntry.title}</h2>
                <p class="resource-description" lang="en">${resourceEntry.description}</p>
            </div>
        </a>
    </div>`;

    document.getElementById("resource-list").innerHTML += html;
}

function filterResources(selectedTags) {
    const resourceList = document.getElementById("resource-list");
    resourceList.innerHTML = '';

    const filteredResources = selectedTags.length === 0 
        ? resources
        : resources.filter(resource => selectedTags.every(tag => resource.tags.includes(tag)));

    filteredResources.forEach(resourceEntry => {
        renderResource(resourceEntry);
    });
}

async function loadResources() {
    let response = await fetch("/data/resources.json");
    let json = await response.json();
    resources = json.resources; 

    filterResources([]); 
}

document.getElementById("filter-container").addEventListener("change", function() {
    const selectedTags = Array.from(document.querySelectorAll("#filter-container input:checked")).map(checkbox => checkbox.value);
    filterResources(selectedTags);
});

document.getElementById("toggle-filters").addEventListener("click", function() {
    const filterContainer = document.getElementById("filter-container");
    if (filterContainer.style.display === "none" || filterContainer.style.display === "") {
        filterContainer.style.display = "flex";
    } else {
        filterContainer.style.display = "none";
    }
});

loadResources();
