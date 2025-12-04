import Task from "../models/task";
import Activity from "../models/activity.model";
import Subtask from "../models/subTask";
import Asset from "../models/asset.model";


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

//SUBTASKS
export const addSubtask = async (req, res) => {
    try {
        const {taskId} = req.params;
        const {title} = req.body;

        if (!title) {
            return res.status(400).json({message: "Subtask title required"});
        }

        const task = await Task.findOne({_id: taskId, user: req.user.id });
        if (!task) {
            return res.status(404).json({message: "Task not found"});
        }

        const subtask = await Subtask.create({
            task: taskId,
            title,
            assignedTo,
            dueDate,
            notes,
            completed: false,
        });

        task.subtasks.push(subtask._id);
        await task.save();

        return res.status(201).json({
            message: "Subtask added",
            subtask,
          });
    } catch (error) {
        console.error("Error adding subtask:", error);
        return res.status(500).json({ message: "Server error" });
      }
};


export const updateSubtask = async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;

        // Ensure the task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Ensure the subtask exists
        let subtask = await Subtask.findById(subtaskId);
        if (!subtask) {
            return res.status(404).json({ message: "Subtask not found" });
        }

        // Update fields sent in body
        const updates = req.body;
        Object.assign(subtask, updates);

        await subtask.save();

        // Add activity log
        await logActivity({
            task: task._id,
            user: req.user.id,
            action: "Subtask Updated",
            details: `Updated subtask: ${subtask.title}`,
          });

        await task.save();

        return res.json({
            message: "Subtask updated successfully",
            subtask,
        });

    } catch (error) {
        console.error("Update subtask error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


export const deleteSubtask = async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;

        // Ensure the task exists
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Ensure the subtask exists
        const subtask = await Subtask.findById(subtaskId);
        if (!subtask) return res.status(404).json({ message: "Subtask not found" });

        // Remove from Subtask collection
        await Subtask.findByIdAndDelete(subtaskId);

        // Remove from task.subtasks array
        task.subtasks = task.subtasks.filter(id => id.toString() !== subtaskId);

        // Add activity log
       await logActivity({
            task: task._id,
            user: req.user.id,
            action: "Subtask Deleted",
            details: `Deleted subtask: ${subtask.title}`,
          });

        await task.save();

        return res.json({ message: "Subtask deleted successfully" });

    } catch (error) {
        console.error("Delete subtask error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ASSETS
export const uploadAssets = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { type, link, description } = req.body;

        if (!type || !link) {
            return res.status(400).json({
              message: "Asset type and link are required",
            });
          }

          const task = await Task.findOne({ _id: taskId, user: req.user.id });

        if (!task) {
             return res.status(404).json({ message: "Task not found" });
         }

         const asset = await Asset.create({
            task: taskId,
            fileUrl,
            fileName,
            fileType,
          });

          task.assets.push(asset._id);
          await task.save();

          return res.status(201).json({
            message: "Asset added",
            asset,
          });
    } catch (error) {
        console.error("Error adding asset:", error);
        return res.status(500).json({ message: "Server error" });
      } 
};

export const deleteAsset = async (req, res) => {
    try {
        const { taskId, assetId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Find asset
        const asset = task.assets.id(assetId);
        if (!asset) return res.status(404).json({ message: "Asset not found" });

        // Remove asset from array
        asset.deleteOne();

        // Activity log
        await logActivity({
            task: task._id,
            user: req.user.id,
            action: "Asset Deleted",
            details: `Deleted asset: ${asset.fileName}`,
          });

        await task.save();

        return res.json({ message: "Asset deleted successfully" });

    } catch (error) {
        console.error("Delete asset error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};



export const updateAsset = async (req, res) => {
    try {
        const { taskId, assetId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const asset = task.assets.id(assetId);
        if (!asset) return res.status(404).json({ message: "Asset not found" });

        Object.assign(asset, req.body); // update metadata (not file upload)

        await logActivity({
            task: task._id,
            user: req.user.id,
            action: "Asset Updated",
            details: `Updated Asset: ${Asset.title}`,
          });

        await task.save();

        return res.json({ message: "Asset updated successfully", asset });

    } catch (error) {
        console.error("Update asset error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
