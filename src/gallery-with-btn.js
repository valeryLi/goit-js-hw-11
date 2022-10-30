import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '30693529-0739abc7bb5433c19d02cabbb';
const axios = require('axios').default;

let perPage = 40;
let gallery = '';
let query = '';
let pageToFetch = 1;
let totalPages = 0;

const refs = {
  form: document.querySelector('.search-form'),
  galleryItems: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.loadMoreBtn.style.display = 'none';

refs.form.addEventListener('submit', onFormSubmit);

async function fetchImages(query, pageToFetch) {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        q: query,
        page: pageToFetch,
        per_page: 40,
        image_type: 'photo',
        orientation: 'orientation',
        safesearch: true,
      },
    });

    if (response.status !== 200) {
      throw new Error(response.status);
    }
    if (response.data.hits.length !== 0 && pageToFetch < 2) {
      totalPages = response.data.totalHits;
      Notify.success(`Hooray! We found ${totalPages} images.`);
    }
    return response.data.hits;
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

async function onFormSubmit(event) {
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
  const events = await fetchImages(query, pageToFetch);

  createGalleryMarkup(events);

  gallery = new SimpleLightbox('.photo-link', {
    overlay: true,
    nav: true,
    docClose: true,
    animationSlide: true,
    close: true,
    enableKeyboard: true,
    overlayOpacity: 0.8,
  });
}

function createGalleryMarkup(data) {
  if (data.length === 0) {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  const markup = data
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

  let countPages = Math.ceil(totalPages / perPage);
  if (pageToFetch === countPages) {
    refs.loadMoreBtn.style.display = 'none';
    return Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }

  refs.galleryItems.insertAdjacentHTML('beforeend', markup);
  refs.loadMoreBtn.style.display = 'inline';
  refs.loadMoreBtn.addEventListener('click', onBtnClick);
  pageToFetch += 1;
}

async function onBtnClick() {
  const events = await fetchImages(query, pageToFetch);

  createGalleryMarkup(events);
  gallery.refresh();
  smoothScroll();
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
