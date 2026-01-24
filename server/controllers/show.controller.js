import axios from "axios";
import "dotenv/config";
import Movie from "../model/Movie.models.js";
import Show from "../model/Show.model.js";

export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_ACCESS_TOKEN}`,
        },
      },
    );
    const movies = data.results;
    res.json({
      message: "Fetch Successfully  from tmdb",
      success: true,
      movies: movies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Something went wrong",
      success: false,
    });
  }
};

export const addShow = async (req, res) => {
  try {
    const { movieId, showInput, showPrice } = req.body;
    let movie = await Movie.findById(movieId);
    if (!movie) {
      const [movieDetailResponse, movieCreditResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_ACCESS_TOKEN}`,
          },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_ACCESS_TOKEN}`,
          },
        }),
      ]);
      const movieApiData = movieDetailResponse.data;
      const movieCreditData = movieCreditResponse.data;

      const movieDetails = {
        _id: movieId,
        id: movieApiData.id,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        casts: movieCreditData.cast,
        genres: movieApiData.genres,
        vote_average: movieApiData.vote_average,
        vote_count: movieApiData.vote_count,
        runtime: movieApiData.runtime,
      };
      movie = await Movie.create(movieDetails);
    }
    const showToCreate = [];
    showInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showToCreate.push({
          movie: movie._id,
          showDateTime: new Date(dateTimeString),
          showPrice: showPrice,
          occupiedSeats: {},
        });
      });
    });
    if (showToCreate.length > 0) {
      await Show.insertMany(showToCreate);
    }
    res.json({
      message: "Show added successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Something went wrong",
      success: false,
    });
  }
};

export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });
    const uniqueShows = new Set(shows.map((show) => show.movie));
    res.json({
      message: "Shows fetched successfully",
      success: true,
      shows: Array.from(uniqueShows),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Something went wrong",
      success: false,
    });
  }
};

export const getShowById = async (req, res) => {
  try {
    const { movieId } = req.params;
    const show = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });
    if (!show) {
      return res.status(404).json({
        message: "Show not found",
        success: false,
      });
    }
    const movie = await Movie.findById(movieId);
    const dateTime = {};
    show.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });
    res.json({
      message: "Show details fetched successfully",
      success: true,
      movie,
      dateTime,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Something went wrong",
      success: false,
    });
  }
};
