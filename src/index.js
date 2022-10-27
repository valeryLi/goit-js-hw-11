import { Notify } from 'notiflix/build/notiflix-notify-aio';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '30693529-0739abc7bb5433c19d02cabbb';

let pageToFetch = 1;
let query = '';
let perPage = 40;

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onBtnClick);

function onFormSubmit(event) {
  event.preventDefault();
  query = event.target.elements.searchQuery.value.trim();

  pageToFetch = 1;
  refs.gallery.innerHTML = '';
  if (!query) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  fetchEvent().then(handleSuccess).catch(handleError);
}

async function fetchEvent() {
  const params = new URLSearchParams({
    key: API_KEY,
    q: query,
    page: pageToFetch,
    per_page: 40,
    image_type: 'photo',
    orientation: 'orientation',
    safesearch: true,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const photo = await response.json();
  return photo;
}

function handleSuccess(data) {
  const hits = data.hits;
  const totalPages = Math.ceil(data.totalHits / perPage);

  if (data.total === 0) {
    refs.loadMoreBtn.classList.add('invisible');
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  renderPhotoCardList(hits);

  if (pageToFetch === totalPages) {
    refs.loadMoreBtn.classList.add('invisible');
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  }

  if (totalPages > 1) {
    refs.loadMoreBtn.classList.remove('invisible');
  }

  if (pageToFetch < 2) {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }
}

function handleError(error) {
  console.log(error);
}

function renderPhotoCardList(events) {
  const markup = events
    .map(({ webformatURL, tags, likes, views, comments, downloads }) => {
      return `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b><span class='text'>Likes</span> ${likes}</b>
    </p>
    <p class="info-item">
      <b><span class='text'>Views</span> ${views}</b>
    </p>
    <p class="info-item">
      <b><span class='text'>Comments</span> ${comments}</b>
    </p>
    <p class="info-item">
      <b><span class='text'>Downloads</span> ${downloads}</b>
    </p>
  </div>
</div>`;
    })
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function onBtnClick() {
  pageToFetch += 1;
  fetchEvent().then(handleSuccess).catch(handleError);
}

//тренировочный код по теме fetch api=============================================
// function fetchEvent(page, q) {
//   const params = new URLSearchParams({
//     key: API_KEY,
//     q,
//     page,
//     per_page: 40,
//     image_type: 'photo',
//     orientation: 'orientation',
//     safesearch: true,
//   });

//   return fetch(`${BASE_URL}?${params}`).then(response => {
//     if (!response.ok) {
//       throw new Error(response.status);
//     }
//     return response.json();
//   });
// }

// function getHits(page, q) {
//   fetchEvent(page, q).then(data => {
//     const hits = data.hits;
//   const totalPages = Math.ceil(data.totalHits / perPage);
//     if (data.total === 0) {
//       refs.loadMoreBtn.classList.add('invisible');
//       alert('no matches');
//     }
// renderPhotoCardList(hits);

//     if (pageToFetch === totalPages) {
//       refs.loadMoreBtn.classList.add('invisible');
//       alert('no more');
//       return;
//     }

//     if (totalPages > 1) {
//       refs.loadMoreBtn.classList.remove('invisible');
//     }

//     pageToFetch += 1;
//   });
// }
