import Task from "../models/task";
import Activity from "../models/activity.model";

export const logActivity  = async ({taskId, userId, action, details = " "}) => {
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


export const createTask = async (req, res) => {
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


/**
 * Get Tasks (user-specific for normal users, all for admin)
 * GET /api/tasks
 * query: ?status=&priority=&dueToday=true
 * access: protected
 */

export const getTask = async (req, res) => {
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


export const getTaskById = async (req, res) => {
    try{
        const task = await Task.findById(req.params.id)
        .populate ("User", "name email")
        .populate ("assignedTo", "name email");

        if (!task) return res.status(404).json({message: "Task not Found"});

        //authorization for admin and users to check Is this user NOT allowed to access the task?

        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString() 
            && !task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())
            return res.status(403).json({message: "Forbiden"});

            res.json(task);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};


//update task

export const taskUpdate = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({message: "Task nor Found"});

        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString())
            return res.status(403).json({message: "Not Authorized"});

        const previous = {
            status: task.status,
            prority: task.priority,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            assignedTo: task.assignedTo,
        };

        const allowed = ["status", "priority", "title", "description", "dueDate", "assignedTo"];

        allowed.forEach((field)=>{
            if (field in req.body) task[field] = req.body[field];
        });

        await task.save;

        //log activities

        if (previous.status !== task.status) {
            await logActivity({
            taskId: task._id,
            userId: req.user._id,
            action: "status_changed",
            details: `Status: ${previous.status} -> ${task.status}`,
            });
    } 
        

        if (previous.priority !== task.priority) {
            await logActivity({
                taskId: task._id,
                userId: req.user._id,
                action: "priority_changed",
                details: `Priority: ${previous.priority} -> ${task.priority}`,

            })
        }

        if (previous.assignedTo?.toString() !== task.assignedTo?.toString()) {
            
            await logActivity ({
                taskId: task._id,
                userId: req.user._id,
                action: "assignment_changed",
                details: `AssignedTo changed`,
        });
        }

        // generic update log
    await logActivity({
        taskId: task._id,
        userId: req.user._id,
        action: "task_updated",
        details: `Task updated`,
      });
  
      res.json(task);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({message: "Task not found"});

        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "forbiden"});
        }

        await task.remove;

        await logActivity({
        taskId: task._id,
        userId: req.user._id,
        action: "task_deleted",
        etails: `Task "${task.title}" deleted`,
        });

        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};