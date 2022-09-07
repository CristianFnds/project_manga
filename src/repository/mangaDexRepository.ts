import axios from "axios";
import { StatusCodes } from 'http-status-codes';

const urlBase = `https://api.mangadex.org`;
const limit = 15;

class MangaDexRepository {

    async obterMangas(manga: string) {
        const url = `${urlBase}/manga?limit=${limit}&title=${manga}`;
        const {data} = await axios.get(url);

        return data;
    }

    async obterCover(cover_id: string) {
        const url = `${urlBase}/cover/${cover_id}`;
        const {data} = await axios.get(url);

        return data.data;
    }



    async ObterNomeManga(manga_id: string) {

        try {
            manga_id = "b1461071-bfbb-43e7-a5b6-a7ba5904649f";
            const url = `${urlBase}/manga/${manga_id}`;

            const data = await axios.get(url);

            const response = {
                nome: data.data.data.attributes.title['en'].replace('.', ',').trim()
            }

            return response;

        } catch (error) {
            console.log(error.message);
        }
    }

    async ListarCapitulos(manga_id: string) {
        try {

            var lista_traduzidos = [];
            manga_id = "64773610-ab68-4ba2-949a-cbba391d7bac";
            var limit = 500;
            var order = "desc";//desc, asc

            var url = `${url}/manga/${manga_id}/feed?limit=${limit}&includes%5B%5D=scanlation_group&includes%5B%5D=user&order%5Bvolume%5D=${order}&order%5Bchapter%5D=${order}&offset=0&contentRating%5B%5D=safe&contentRating%5B%5D=suggestive&contentRating%5B%5D=erotica&contentRating%5B%5D=pornographic`
            const response = await axios.get(url);

            if (response.status != StatusCodes.OK)
                throw new Error("Erro em obter a lista de manga")

            var listaManga = response.data.data;

            for (let manga of listaManga) {
                if (manga.attributes.translatedLanguage == "pt-br") {
                    lista_traduzidos.push(manga);
                }
            }
            this.request2(lista_traduzidos);
        } catch (error) {
            console.log(error.message);
        }
    }

    async request2(lista_traduzidos) {

        for (let manga of lista_traduzidos) {

            var capitulo = manga.attributes.chapter;
            var hash = manga.attributes.hash;
            var comprimida = manga.attributes.dataSaver;
            // render_image(capitulo, hash, comprimida)
        }
    }

    async ObterCoverArtImage() {
        try {

            const manga_id = "73be335c-bcdf-4668-b757-3730010932e2";
            let url = `https://api.mangadex.org/cover/?limit=1&manga[]=${manga_id}`;
            let response = await axios.get(url);

            const fileName = response.data.data[0].attributes.fileName;

            url = `https://uploads.mangadex.org/covers/${manga_id}/${fileName}`;
            response = await axios.get(url);



            let raw = Buffer.from(response.data).toString('base64');
            return "data:" + response.headers["content-type"] + ";base64," + raw;

            // let data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(response.data).toString('base64');
            // return `<img src="${data}" alt="Red dot" />`;

        } catch (error) {
            console.log(error.message);
        }


    }


}

export { MangaDexRepository };