import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '30693529-0739abc7bb5433c19d02cabbb';

let pageToFetch = 1;
let query = '';
let perPage = 40;

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
const refs = {
  form: document.querySelector('.search-form'),
  galleryItems: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onBtnClick);

function onFormSubmit(event) {
  event.preventDefault();
  query = event.target.elements.searchQuery.value.trim();

  pageToFetch = 1;
  refs.galleryItems.innerHTML = '';
  if (!query) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  fetchEvent().then(handleSuccess).catch(handleError);
}

function handleSuccess(data) {
  const hits = data.hits;
  const totalPages = Math.ceil(data.totalHits / perPage);
  console.log(hits);

  if (data.total === 0) {
    refs.loadMoreBtn.classList.add('invisible');
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  createGalleryMarkup(hits);

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

  if (data.totalHits !== 0 && pageToFetch < 2) {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  new SimpleLightbox('.photo-link', {
    overlay: true,
    nav: true,
    docClose: true,
    animationSlide: true,
    close: true,
    enableKeyboard: true,
    overlayOpacity: 0.8,
  });

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function handleError(error) {
  console.log(error);
}

function createGalleryMarkup(events) {
  const markup = events
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class='photo-link link' href="${largeImageURL}"><div class="photo-card">
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
</div>
</a>`;
      }
    )
    .join('');

  refs.galleryItems.insertAdjacentHTML('beforeend', markup);
}

function onBtnClick() {
  pageToFetch += 1;
  fetchEvent().then(handleSuccess).catch(handleError);
  gallery.refresh();
}
