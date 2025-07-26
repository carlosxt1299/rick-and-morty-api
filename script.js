document.addEventListener('DOMContentLoaded', () => {
    const characterContainer = document.getElementById('characterContainer');
    const loadingMessage = document.getElementById('loading');
    const noResultsMessage = document.getElementById('noResults');
    const nameFilter = document.getElementById('nameFilter');
    const statusFilter = document.getElementById('statusFilter');
    const genderFilter = document.getElementById('genderFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageInfo = document.getElementById('currentPageInfo');

    let currentPage = 1;
    let nextPageUrl = null;
    let prevPageUrl = null;
    let currentFilters = {
        name: '',
        status: '',
        gender: ''
    };

    let searchTimeout = null;
    const DEBOUNCE_DELAY = 300;

    const BASE_URL = 'https://rickandmortyapi.com/api/character';

    const showLoading = () => {
        loadingMessage.classList.remove('hidden');
        characterContainer.innerHTML = '';
        noResultsMessage.classList.add('hidden');
    };

    const hideLoading = () => {
        loadingMessage.classList.add('hidden');
    };

    const showNoResults = () => {
        noResultsMessage.classList.remove('hidden');
        characterContainer.innerHTML = '';
    };

    const hideNoResults = () => {
        noResultsMessage.classList.add('hidden');
    };

    const renderCharacter = (character) => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'character-card-main';

        cardWrapper.innerHTML = `
            <div class="character-card-border-effect"></div>
            <div class="relative z-10 h-full flex flex-col">
                <img src="${character.image}" alt="${character.name}" class="w-full object-cover">

                <div class="character-info-white-bg">
                    <h3 class="font-bold truncate">${character.name}</h3>
                    <p class="text-gray-700 text-sm">Estado: <span class="${character.status === 'Alive' ? 'text-green-600' : character.status === 'Dead' ? 'text-red-600' : 'text-gray-600'} font-semibold">${character.status}</span></p>
                    <p class="text-gray-700 text-sm">Especie: <span class="font-semibold">${character.species}</span></p>
                </div>
            </div>
        `;

        cardWrapper.addEventListener('click', () => {
            document.querySelectorAll('.character-card-main').forEach(card => {
                card.classList.remove('selected');
            });
            cardWrapper.classList.add('selected');
        });

        characterContainer.appendChild(cardWrapper);
    };

    const fetchCharacters = async (url = BASE_URL) => {
        showLoading();
        hideNoResults();
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    hideLoading();
                    showNoResults();
                    prevPageBtn.disabled = true;
                    nextPageBtn.disabled = true;
                    currentPageInfo.textContent = `Página 0`;
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            characterContainer.innerHTML = '';
            if (data.results && data.results.length > 0) {
                data.results.forEach(renderCharacter);
                hideNoResults();
            } else {
                showNoResults();
            }

            nextPageUrl = data.info.next;
            prevPageUrl = data.info.prev;

            const urlParams = new URLSearchParams(url.split('?')[1]);
            currentPage = parseInt(urlParams.get('page')) || 1;
            currentPageInfo.textContent = `Página ${currentPage}`;

        } catch (error) {
            console.error("Error fetching characters:", error);
            characterContainer.innerHTML = `<p class="text-red-500 text-center">Error al cargar los personajes. Por favor, inténtalo de nuevo.</p>`;
            hideNoResults();
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            currentPageInfo.textContent = `Error`;
        } finally {
            hideLoading();
        }
    };

    const buildApiUrl = () => {
        const params = new URLSearchParams();
        if (currentFilters.name) {
            params.append('name', currentFilters.name);
        }
        if (currentFilters.status) {
            params.append('status', currentFilters.status);
        }
        if (currentFilters.gender) {
            params.append('gender', currentFilters.gender);
        }
        return `${BASE_URL}?${params.toString()}`;
    };

    nameFilter.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.name = nameFilter.value.trim();
            currentPage = 1;
            fetchCharacters(buildApiUrl());
        }, DEBOUNCE_DELAY);
    });

    statusFilter.addEventListener('change', () => {
        currentFilters.status = statusFilter.value;
        currentPage = 1;
        fetchCharacters(buildApiUrl());
    });

    genderFilter.addEventListener('change', () => {
        currentFilters.gender = genderFilter.value;
        currentPage = 1;
        fetchCharacters(buildApiUrl());
    });

    applyFiltersBtn.addEventListener('click', () => {
        currentFilters.name = nameFilter.value.trim();
        currentFilters.status = statusFilter.value;
        currentFilters.gender = genderFilter.value;
        currentPage = 1;
        fetchCharacters(buildApiUrl());
    });

    prevPageBtn.addEventListener('click', () => {
        if (prevPageUrl) {
            fetchCharacters(prevPageUrl);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (nextPageUrl) {
            fetchCharacters(nextPageUrl);
        }
    });

    fetchCharacters();
});