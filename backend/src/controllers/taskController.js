import Task from "../models/task";
import Activity from "../models/activity.model";

const logActivity  = async ({taskId, userId, action, details = " "}) => {
    try{
        await Activity.create({
            task: taskId,
            user: userId,
            action,
            details,
        });
    } catch(error){
        console.error("Activity logging failed:", err.message);
    }
};


const createTask = async (req, res) => {
    try{
        const {title, description, assignedTo, priority, dueDate} = req.body;
        if(!title) return res.status(400).json({ message: "Title is required" });

        const task = await Task.create({
            title,
            description: description || "",
            assignedTo: assignedTo || null,
            priority: priority || null,
            dueDate: dueDate || null,
        });

        logActivity({
            task: task._id,
            user: user._id,
            action: "task_created",
            details: `Task "${task.title}" created`,
        });

        res.status(201).json(task);

    } catch (error) {
        res.status(500).json({ message: error.message });
      }
};


const getTask = async (req, res) => {
    try{
        const {status, dueDate, priority} = req.query;
        const filter = {};

        if(req.user.role !== "admin"){
            filter.$or = [{ user: req.user._id }, { assignedTo: req.user._id }];
        }

        if(status) filter.status = status;
        if(priority) filter.priority = priority;
        if (dueToday === "true") {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            filter.dueDate = { $gte: start, $lte: end };
          }

          const tasks = await Task.find(filter)
          .populate("user", "name email")
          .populate("assignedTo", "name email")
          .sort({ createdAt: -1 });
    
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};