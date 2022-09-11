import { Router } from "express";
import { MangaController } from "./controller/MangaController";

const routes = Router();
const mangaController = new MangaController();

routes.get("/", mangaController.index)
routes.get("/manga", mangaController.all)
routes.get("/show", mangaController.show)
routes.get("/read", mangaController.read)
routes.get("/nextChapter", mangaController.nextChapter)
routes.get("/previousChapter", mangaController.previousChapter)

export { routes };