import { Request, Response } from "express";
import { MangaDexRepository } from "../repository/mangaDexRepository";

const repository = new MangaDexRepository();

interface Manga {
    id: string;
    name: string;
    cover_art_id: string;
    cover_art_file_name: string;
}

class MangaController {

    async all(request: Request, response: Response) {
        try {
            const { busca } = request.query;
            const data = await repository.obterMangas(busca.toString());

            var listaMangas = [];

            for (var i = 0; i < data.total; i++) {

                try {
                    let cover_id = data.data[i].relationships.find(x => x.type == 'cover_art').id;
                    let cover = await repository.obterCover(cover_id);

                    var aux: Manga = {
                        id: data.data[i].id,
                        name: data.data[i].attributes.title.en,
                        cover_art_id: cover_id,
                        cover_art_file_name: cover.attributes.fileName
                    };

                    listaMangas.push(aux);
                    break;
                } catch (error) {
                    console.log('error ao tentar obter informacoes sobre o manga')
                }

            };
            
            var result = {
                "noticias": [
                    {
                        "titulo": "Primeira notícia",
                        "noticia": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
                    },
                    {
                            "titulo": "Segunda notícia",
                                    "noticia": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
                    }
            
                ]
            };

            console.log('Tentando redicionar para view')
            
            response.render("news/index", {news : result});

            // response.status(200).json(listaMangas);

        } catch (error) {
            console.error(error);
            response.status(500).end("Erro ao obter lista de mangas");
        }
    }
}

export { MangaController };