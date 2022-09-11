import axios from "axios";
import { StatusCodes } from 'http-status-codes';

const urlBase = `https://api.mangadex.org`;
const limit = 12;

class MangaDexRepository {

    async obterMangas(manga: string) {

        const params = {
            limit: limit,
            title: manga,
            'availableTranslatedLanguage[]': 'pt-br'
        };

        const url = `${urlBase}/manga`;
        const { data } = await axios.get(url, { params });

        return data;
    }

    async obterCover(cover_id: string) {
        const url = `${urlBase}/cover/${cover_id}`;
        const { data } = await axios.get(url);

        return data.data;
    }

    async obterCapitulos(manga_id: string, offset = 0) {

        const params = {
            limit: 100,
            offset: offset,
            manga: manga_id,
            'order[volume]': 'asc',
            'order[chapter]': 'asc',
            'translatedLanguage[]': 'pt-br'
        };

        const url = `${urlBase}/chapter`;
        const { data } = await axios.get(url, { params });

        return data;
    }

    async obterCapitulo(chapter_id:string){
        const url = `${urlBase}/chapter/${chapter_id}`;
        const { data } = await axios.get(url);

        return data.data;
    }

    async obterManga(manga_id: string) {

        const url = `${urlBase}/manga/${manga_id}`;
        const { data } = await axios.get(url);

        return data.data;
    }

    async obterPaginas(chapter_id: string) {
        const url = `${urlBase}/at-home/server/${chapter_id}`;
        const { data } = await axios.get(url);

        return data;
    }
}

export { MangaDexRepository };