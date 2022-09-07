import { Router } from "express";
import { MangaController } from "./controller/MangaController";

const routes = Router();
const settingsController = new MangaController();

routes.get("/manga", settingsController.all)

export { routes };