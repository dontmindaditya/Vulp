import {
    getPublishedPlaylists,
    getPlaylistBySlug,
    getPlaylistById,
} from "../services/playlist.service";

export const playlistQueries = {
    getPublished: getPublishedPlaylists,
    getBySlug: getPlaylistBySlug,
    getById: getPlaylistById,
};