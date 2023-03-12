import axios from 'axios';
const API_KEY = '34212325-c6ab7e135f4fe9a0ab32789f1';
const BASE_URL = 'https://pixabay.com/api/';
export default class ImagesApi {
  constructor() {
    this.searchQuery = '';
    this.page = 0;
    this.totalHits = null;
    this.imagesPerPage = 40;
  }
  async fetchImages() {
    this.incrementPage();
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: this.page,
        per_page: this.imagesPerPage,
        q: this.searchQuery,
      },
    });
    this.totalHits = response.data.totalHits;
    return response.data;
  }
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 0;
    this.totalHits = null;
  }
}
