const db = require("../database/models");
const createError = require("http-errors");

const getAllMovies = async (limit, offset) => {
  try {
    const movies = await db.Movie.findAll({
      limit,
      offset,
      attributes: {
        exclude: ["created_at", "updated_at", "genre_id"],
      },
      include: [
        {
          association: "genre",
          attribute: ["id", "name"],
        },
        {
          association: "actors",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    const total = await db.Movie.count();

    return {
      movies,
      total,
    };
  } catch (error) {
    console.log(error);
    throw {
      status: error.status || 500,
      message: error.message || "Upss, hubo un error :(",
    };
  }
};

const getMovieById = async (id) => {
  try {
    if (!id) throw createError(400, "ID inexistente");
    const movie = await db.Movie.findByPk(id, {
      attributes: {
        exclude: ["created_at", "updated_at", "genre_id"],
      },
      include: [
        {
          association: "genre",
          attribute: ["id", "name"],
        },
        {
          association: "actors",
          attributes: ["id", "first_name", "last_name"],
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!movie) throw createError(404, "Pelicula inexistente");

    return movie;
  } catch (error) {
    console.log(error);
    throw {
      status: error.status || 500,
      message: error.message || "Upss, hubo un error :(",
    };
  }
};

const createMovie = async (dataMovie, actors) => {
  try {
    const newMovie = await db.Movie.create(dataMovie);

    if (actors) {
      const actorsDB = actors.map((actor) => {
        return {
          movie_id: newMovie.id,
          actor_id: actor,
        };
      });
      await db.Actor_Movie.bulkCreate(actorsDB, {
        validate: true,
      });
    }

    return newMovie;
  } catch (error) {
    console.log(error);
    throw {
      status: error.status || 500,
      message: error.message || "Upss, hubo un error :(",
    };
  }
};

const updateMovie = async (id, dataMovie) => {
  try {
    const { title, awards, rating, length, release_date, genre_id, actors } =
      dataMovie;

    const movie = await db.Movie.findByPk(id);

    movie.title = title || movie.title;
    movie.awards = awards || movie.awards;
    movie.rating = rating || movie.rating;
    movie.length = length || movie.length;
    movie.release_date = release_date || movie.release_date;
    movie.genre_id = genre_id || movie.genre_id;

    await movie.save();

    if (actors) {
      await db.Actor_Movie.destroy({
        where: {
          movie_id: id,
        },
      });
      const actorArray = actors.map(actor => {
        return {
          movie_id: id,
          actor_id: actor,
        };
      });
      await db.Actor_Movie.bulkCreate(actorArray, {
        validate: true,
      });
    }

    return movie;
  } catch (error) {
    console.log(error);
    throw {
      status: error.status || 500,
      message: error.message || "Upss, hubo un error :(",
    };
  }
};

const deleteMovie = async (id) => {
  try {
    
    await db.Actor_Movie.destroy({
      where : {
        movie_id : id
      }
    });

    const movie = await db.Movie.findByPk(id)
    await movie.destroy()

    return null
  } catch (error) {
    console.log(error);
    throw {
      status: error.status || 500,
      message: error.message || "Upss, hubo un error :(",
    };
  }
}

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};
