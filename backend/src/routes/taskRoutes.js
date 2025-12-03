import express from "express";

import {
    createTask,
    getTask,
    getTaskById,
    taskUpdate,
    deleteTask,
} from "../controllers/taskController";

import {protect} from "../middleware/auth.middleware";

const router = express.Router();

router.route("/")
  .post(protect, createTask)
  .get(protect, getTasks);

  router.route("/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

export default router;