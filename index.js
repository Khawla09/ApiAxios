import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_sm59yDdzoEBxATahMQySxPzcWx51HOIlu30HkBSg69oHvgnAods4lv393KLiS3Q3";
// Set default headers and base URL for axios
axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;
// 5. Add axios interceptors to log the time between request and response to the console.
axios.interceptors.request.use((config) => {
  console.log("Request started at:", new Date().toISOString());
  document.body.style.cursor = "progress";
  progressBar.style.width = "0%";
  return config;
});

axios.interceptors.response.use((response) => {
  console.log("Response received at:", new Date().toISOString());
  document.body.style.cursor = "default";
  progressBar.style.width = "100%";
  setTimeout(() => {
    progressBar.style.width = "0%";
  }, 500);
  return response;
});
// * 6. Next, we'll create a progress bar to indicate the request is in progress.
const updateProgress = (progressEvent) => {
  const { loaded, total } = progressEvent;
  const percentage = Math.floor((loaded * 100) / total);
  progressBar.style.width = `${percentage}%`;
};

//  * 1. Create an async function "initialLoad" that does the following:

const initialLoad = async () => {
  try {
    // const response = await axios.get("/breeds");
    const response = await axios("/breeds", {
      onDownloadProgress: updateProgress,
    });
    const breeds = response.data;
    console.log(breeds);
    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    breedSelect.addEventListener("change", breedSelectHandler);
  } catch (error) {
    console.error("Error fetching breeds:", error);
  }
};
//  2. Create an event handler for breedSelect
const breedSelectHandler = async (e) => {
  e.preventDefault();
  const selectedBreedId = e.target.value;
  //ID of selected element
  console.log(selectedBreedId);

  if (selectedBreedId) {
    const breedData = await fetchBreedDetails(selectedBreedId);
    console.log(breedData);
    displayBreedDetails(breedData);
  }
};

// //Retrieve information on the selected breed from the cat API using fetch().
const fetchBreedDetails = async (breedId) => {
  try {
    const response = await axios(
      `images/search?limit=10&breed_ids=${breedId}`,
      {
        onDownloadProgress: updateProgress,
      }
    );
    const breedData = response.data;
    return breedData;
  } catch (error) {
    console.log(error);
  }
};
const displayBreedDetails = (breedData) => {
  //clear previous content

  infoDump.innerHTML = "";
  Carousel.clear();
  const breed = breedData[0].breeds[0];
  infoDump.innerHTML = `
  <h3>${breed.id}</h3>
  <p>${breed.description}</p>`;
  breedData.forEach((imgDet) => {
    const carouselItem = Carousel.createCarouselItem(
      imgDet.url,
      breed.id,
      imgDet.id
    );
    Carousel.appendCarousel(carouselItem);
  });
  //start carousel
  Carousel.start();
};
//  * 8. To practice posting data, we'll create a system to "favourite" certain images.
//favorite functionality
export async function favourite(imgId) {
  //check if the image is already favorated
  try {
    const favouritesResponse = await axios.get("/favourites");
    const favourites = favouritesResponse.data;
    const favoutiteElm = favourites.find((fav) => fav.image_id === imgId);
    if (favoutiteElm) {
      await axios.delete(`/favourites/${favoutiteElm.id}`);
    } else {
      await axios.post(`/favourites`, { image_id: imgId });
    }
  } catch (error) {
    console.error("Error toggling favourite: ", error);
  }
}
//Get favourite image and display it in the carousel
const getFavourites = async () => {
  try {
    const response = await axios.get("/favourites");
    const favourites = response.data;

    Carousel.clear(); //clear previous carousel itenms
    //add favourite item to the carousel
    favourites.forEach((favourite, index) => {
      const carouselItem = Carousel.createCarouselItem(
        favourite.image.url,
        "Favourite Image",
        favourite.image_id
      );
      if (index === 0) {
        carouselItem.classList.add("active");
      }
      Carousel.appendCarousel(carouselItem);
    });
    //start carousel
    Carousel.start();
  } catch (error) {
    console.error(error);
  }
};
getFavouritesBtn.addEventListener("click", getFavourites);
initialLoad();
