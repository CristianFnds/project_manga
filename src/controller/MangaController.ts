import { Request, Response } from "express";
import { MangaDexRepository } from "../repository/mangaDexRepository";

const repository = new MangaDexRepository();

interface Manga {
    id: string;
    name: string;
    cover_art_id: string;
    cover_art_file_name: string;
}

interface Chapter {
    id: string,
    volume: string,
    chapter: string,
    language: string,
}

interface Page {
    chapter_id: string,
    hash: string,
    data: string[],
    chapter: number
}

class MangaController {

    async index(request: Request, response: Response) {
        response.render('index');
    }

    async all(request: Request, response: Response) {
        try {
            const { title } = request.query;
            const { data } = await repository.obterMangas(title.toString());

            var listaMangas = [];

            for (const manga of data) {
                listaMangas.push(await getInfoManga(manga.id))
            };

            response.status(200).json(listaMangas);
        } catch (error) {
            response.status(500).end("Erro ao obter lista de mangas");
        }
    }

    async show(request: Request, response: Response) {
        try {
            const { manga_id } = request.query;

            const manga = await getInfoManga(manga_id);
            const capitulos = await getAllChapter(manga_id);

            response.render('show', { capitulos, manga });
        } catch (error) {
            response.status(500).end("Erro ao obter lista de capitulos");
        }
    }

    async read(request: Request, response: Response) {
        const { chapter_id } = request.query;
        const page = await repository.obterPaginas(chapter_id.toString());

        var paginas = await getInfoPage(page.chapter, chapter_id);

        response.render('read', { paginas });
    }

    async nextChapter(request: Request, response: Response) {
        const { chapter_id } = request.query;

        var chapter = await getMangaIdByChapter(chapter_id)
        const capitulos = await getAllChapter(chapter.manga_id);

        for(var i =0;i<capitulos.length;i++)
            if(capitulos[i].id==chapter_id)
                 return response.redirect(`/read?chapter_id=${capitulos[++i].id}`); 
    }

    async previousChapter(request: Request, response: Response) {
        const { chapter_id } = request.query;

        var chapter = await getMangaIdByChapter(chapter_id)
        const capitulos = await getAllChapter(chapter.manga_id);

        for(var i =0;i<capitulos.length;i++)
            if(capitulos[i].id==chapter_id)
                 return response.redirect(`/read?chapter_id=${capitulos[--i].id}`); 
    }
}

async function getMangaIdByChapter(chapter_id) {
    var chapter = await repository.obterCapitulo(chapter_id.toString())
    return {
        manga_id: chapter.relationships.find(x => x.type == 'manga').id,
        chapter: chapter.attributes.chapter
    };

}

async function getInfoManga(manga_id) {
    const data = await repository.obterManga(manga_id.toString())
    let cover_id = data.relationships.find(x => x.type == 'cover_art').id;
    let cover = await repository.obterCover(cover_id);

    var aux: Manga = {
        id: data.id,
        name: data.attributes.title.en,
        cover_art_id: cover_id,
        cover_art_file_name: cover.attributes.fileName
    };

    return aux;
}

function getInfoChapter(chapter) {
    var capitulo: Chapter = {
        id: chapter.id,
        volume: chapter.attributes.volume,
        chapter: chapter.attributes.chapter,
        language: chapter.attributes.translatedLanguage,
    }
    return capitulo;
}

async function getAllChapter(manga_id) {
    const chapters = await repository.obterCapitulos(manga_id);
    var retorno = [];
    var capitulos = [];

    capitulos.push(chapters.data);

    if (chapters.total > 100) {
        var repeticoes = Math.floor(chapters.total / 100);

        for (var i = 1; i <= repeticoes; i++) {
            var aux = await repository.obterCapitulos(manga_id, i * 100);
            capitulos.push(aux.data);
        }
    }

    for (var i = 0; i < capitulos.length; i++) {
        for (const chapter of capitulos[i]) {
            retorno.push(getInfoChapter(chapter));
        }
    }
    return retorno;
}

async function getInfoPage(page, chapter_id) {

 var chapter =  await getMangaIdByChapter(chapter_id)

    var pagina: Page = {
        chapter_id: chapter_id,
        chapter: chapter.chapter,
        hash: page.hash,
        data: page.dataSaver
    }

    return pagina;
}

export { MangaController };