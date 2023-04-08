import { Request, Response } from "express";
import { MangaDexRepository } from "../repository/mangaDexRepository";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import axios from "axios";
const imageSize = require('image-size')

const repository = new MangaDexRepository();
const dir = 'src/public/files';

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

interface Imagem {
    image: Buffer,
    height: number,
    width: number
}

class MangaController {

    async index(request: Request, response: Response) {
        response.render('index');
    }

    async search(request: Request, response: Response) {
        try {
            const { title } = request.query;
            const { data } = await repository.obterMangas(title.toString());

            var listaMangas = await getInfoMangas(data);

            response.status(200).json(listaMangas);
        } catch (error) {
            response.status(500).end("Erro ao obter lista de mangas");
        }
    }

    async show(request: Request, response: Response) {
        try {
            const { manga_id } = request.query;

            const manga = await getInfoManga(manga_id.toString());
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

        for (var i = 0; i < capitulos.length; i++)
            if (capitulos[i].id == chapter_id)
                return response.redirect(`/read?chapter_id=${capitulos[++i].id}`);
    }

    async previousChapter(request: Request, response: Response) {
        const { chapter_id } = request.query;

        var chapter = await getMangaIdByChapter(chapter_id)
        const capitulos = await getAllChapter(chapter.manga_id);

        for (var i = 0; i < capitulos.length; i++)
            if (capitulos[i].id == chapter_id)
                return response.redirect(`/read?chapter_id=${capitulos[--i].id}`);
    }

    async downloadAllChapter(request: Request, response: Response) {
        try {
            const { id } = request.query;

            var chapters = await getAllChapter(id);
            var manga = await getInfoManga(id.toString());

            var dirManga = `${dir}/${manga.name}`

            if (!fs.existsSync(dirManga))
                fs.mkdirSync(dirManga);

            let i = 0;

            for (const capitulo of chapters) {

                const page = await repository.obterPaginas(capitulo.id);
                var paginas = await getInfoPage(page.chapter, capitulo.id);

                const file = `${dirManga}/Capitulo_${capitulo.chapter}.pdf`;

                var pdfDoc = new PDFDocument({ autoFirstPage: false });

                var imagens: Imagem[] = [];

                let j = 0;
                for (const pagina of paginas.data) {

                    var { data } = await axios.get(`https://uploads.mangadex.org/data-saver/${paginas.hash}/${pagina}`, {
                        responseType: 'arraybuffer'
                    })

                    var image = Buffer.from(data, 'base64');

                    const dimension = imageSize(data)

                    imagens.push(
                        {
                            image: image,
                            height: dimension.height * 0.5,
                            width: dimension.width * 0.5
                        });

                    console.log(`capitulo_${capitulo.chapter}:Page_${j}`);
                
                    if (j == 1) 
                        break;
                    j++;
                }

                pdfDoc.pipe(fs.createWriteStream(file));

                for (const imagem of imagens) {
                    pdfDoc.addPage({ size: [imagem.width, imagem.height] })
                        .image(imagem.image, 0, 0, { width: imagem.width, heigth: imagem.height })
                }

                pdfDoc.end();

                if (i == 0)
                    break;
                i++;
            }

            console.log("Termino")
           return response.status(200).end();

        } catch (error) {
            console.log('deu erro');
            response.status(500).end();
        }
    }
}

async function getMangaIdByChapter(chapter_id) {
    var chapter = await repository.obterCapitulo(chapter_id.toString())
    return {
        manga_id: chapter.relationships.find(x => x.type == 'manga').id,
        chapter: chapter.attributes.chapter
    };

}

async function getInfoManga(manga_id: string) {

    const manga = await repository.obterManga(manga_id.toString())

    let cover_id = manga.relationships.find(x => x.type == 'cover_art').id;
    var corver = await repository.obterCover(cover_id);

    var aux: Manga = {
        id: manga.id,
        name: manga.attributes.title.en,
        cover_art_id: cover_id,
        cover_art_file_name: corver.attributes.fileName
    };

    return aux;
}

async function getInfoMangas(mangas) {

    var promisses = [];
    var listaMangas = [];

    for (const manga of mangas) {
        promisses.push(repository.obterCover(manga.relationships.find(x => x.type == 'cover_art').id));
    }

    var corvers = await Promise.all(promisses);

    for (const manga of mangas) {
        let cover_id = manga.relationships.find(x => x.type == 'cover_art').id;
        var aux: Manga = {
            id: manga.id,
            name: manga.attributes.title.en,
            cover_art_id: cover_id,
            cover_art_file_name: corvers.find(x => x.id == cover_id).attributes.fileName
        };
        listaMangas.push(aux);
    }

    return listaMangas;
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

    var chapter = await getMangaIdByChapter(chapter_id)

    var pagina: Page = {
        chapter_id: chapter_id,
        chapter: chapter.chapter,
        hash: page.hash,
        data: page.dataSaver
    }

    return pagina;
}

export { MangaController };