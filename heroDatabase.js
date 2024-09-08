let heroes = [];
let currentPage = 1;
let pageSize = 20;
let sortColumn = 'name';
let sortOrder = 'asc';

const heroList = document.getElementById('hero-list');
const heroModal = document.getElementById('hero-modal');
const heroDetails = document.getElementById('hero-details');
const closeBtn = document.querySelector('.close');
const searchInput = document.getElementById('search-input');
const pageSizeSelect = document.getElementById('pageSize');
const paginationDiv = document.getElementById('pagination');

function loadData(data) {
    heroes = data;
    renderHeroes();
}

function renderHeroes() {
    const filteredHeroes = filterHeroes();
    const sortedHeroes = sortHeroes(filteredHeroes);
    const paginatedHeroes = paginateHeroes(sortedHeroes);

    heroList.innerHTML = '';
    paginatedHeroes.forEach(hero => {
        heroList.appendChild(createHeroRow(hero));
    });

    renderPagination(filteredHeroes.length);
}

function createHeroRow(hero) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td data-label="Icon"><img src="${hero.images.xs}" alt="${hero.name} icon" class="hero-icon"></td>
        <td data-label="Name">${hero.name}</td>
        <td data-label="Full Name">${hero.biography.fullName || ''}</td>
        <td data-label="Powerstats">
            <div class="powerstats">
                ${Object.entries(hero.powerstats).map(([stat, value]) => 
                    `<span class="powerstat" data-stat="${stat}">${stat}: ${value}</span>`
                ).join('')}
            </div>
        </td>
        <td data-label="Race">${hero.appearance.race || ''}</td>
        <td data-label="Gender">${hero.appearance.gender || ''}</td>
        <td data-label="Height">${hero.appearance.height.join(' / ')}</td>
        <td data-label="Weight">${hero.appearance.weight.join(' / ')}</td>
        <td data-label="Place of Birth">${hero.biography.placeOfBirth || ''}</td>
        <td data-label="Alignment">${hero.biography.alignment || ''}</td>
    `;
    row.addEventListener('click', (e) => {
        if (!e.target.closest('.powerstat')) {
            showHeroDetails(hero);
        }
    });
    return row;
}

function showHeroDetails(hero) {
    heroDetails.innerHTML = `
        <img src="${hero.images.xs.replace('/xs/', '/lg/')}" alt="${hero.name}" style="max-width: 100%; height: auto;">
        <h2>${hero.name}</h2>
        <p><strong>Full Name:</strong> ${hero.biography.fullName || ''}</p>
        <h3>Powerstats</h3>
        <ul>
            ${Object.entries(hero.powerstats).map(([stat, value]) => 
                `<li>${stat}: ${value}</li>`
            ).join('')}
        </ul>
        <p><strong>Race:</strong> ${hero.appearance.race || ''}</p>
        <p><strong>Gender:</strong> ${hero.appearance.gender || ''}</p>
        <p><strong>Height:</strong> ${hero.appearance.height.join(' / ')}</p>
        <p><strong>Weight:</strong> ${hero.appearance.weight.join(' / ')}</p>
        <p><strong>Place of Birth:</strong> ${hero.biography.placeOfBirth || ''}</p>
        <p><strong>Alignment:</strong> ${hero.biography.alignment || ''}</p>
    `;
    heroModal.style.display = 'block';
}

function filterHeroes() {
    const searchTerm = searchInput.value.toLowerCase();
    return heroes.filter(hero => 
        hero.name.toLowerCase().includes(searchTerm) ||
        (hero.biography.fullName && hero.biography.fullName.toLowerCase().includes(searchTerm))
    );
}

function sortHeroes(heroesToSort) {
    return heroesToSort.sort((a, b) => {
        let aValue, bValue;
        
        if (sortColumn.startsWith('powerstats.')) {
            const stat = sortColumn.split('.')[1];
            aValue = a.powerstats[stat];
            bValue = b.powerstats[stat];
        } else {
            aValue = getNestedProperty(a, sortColumn);
            bValue = getNestedProperty(b, sortColumn);
        }

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue === undefined || aValue === '') return 1;
        if (bValue === undefined || bValue === '') return -1;

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
}

function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key] !== undefined ? current[key] : undefined, obj);
}

function paginateHeroes(heroesToPaginate) {
    if (pageSize === 'all') return heroesToPaginate;
    const start = (currentPage - 1) * pageSize;
    return heroesToPaginate.slice(start, start + parseInt(pageSize));
}

function renderPagination(totalHeroes) {
    paginationDiv.innerHTML = '';
    if (pageSize === 'all') return;

    const totalPages = Math.ceil(totalHeroes / pageSize);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            renderHeroes();
        });
        if (i === currentPage) {
            button.disabled = true;
        }
        paginationDiv.appendChild(button);
    }
}

closeBtn.onclick = function() {
    heroModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == heroModal) {
        heroModal.style.display = 'none';
    }
}

searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderHeroes();
});

pageSizeSelect.addEventListener('change', (e) => {
    pageSize = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    currentPage = 1;
    renderHeroes();
});

document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const column = th.dataset.sort;
        if (column === sortColumn) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortOrder = 'asc';
        }
        renderHeroes();
    });
   
});

// Add event listener for powerstat sorting
document.getElementById('hero-list').addEventListener('click', (e) => {
    const powerstat = e.target.closest('.powerstat');
    console.log(sortColumn)
    if (powerstat) {
        const stat = powerstat.dataset.stat;
        sortColumn = `powerstats.${stat}`;
        if (sortColumn === `powerstats.${stat}`) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            sortOrder = 'desc';
        }
        renderHeroes();
    }
});

// Fetch the superhero data
fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
    .then(response => response.json())
    .then(loadData)
    .catch(error => {
        console.error('Error fetching superhero data:', error);
        heroList.innerHTML = '<tr><td colspan="10">Error loading superhero data. Please try again later.</td></tr>';
    });