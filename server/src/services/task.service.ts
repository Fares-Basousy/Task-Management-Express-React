
import Task from "../models/task.model"
import { VerifyUpdateTask, VerifyCreateTask } from "@/validators/task.validator";

export class TaskService {
  constructor() {}  
async createTask(
    userId: string,
    name: string,
    description: string,
    priority?: number,
    status?: number,
    dueDate?: number
){
    try{

        const valid = VerifyCreateTask.safeParse({
            name,
            description,
            priority,
            status,
            dueDate
        });

        if(!valid.success)
            return { status:400, message: valid.error.issues.map(i => i.message).join(", ")};

        const task = new Task({userId, name, description, priority, status, dueDate});

        await task.save();

        return {
            status:200,
            message:"Task created successfully",
            data:task
        };

    }catch(error:any){
        return {
            status:500,
            message:error.message
        };
    }
}
async deleteTask(userId:string,id:string){

    try{


        if(userId.length<1){
            return {
                status:400,
                message:'Unauthorized user.'
            };
        }
        else if (id.length<1){
          return {
                status:400,
                message:'unidentifed Task.'
            };
        }

        const task = await Task.findOne({
            _id:id,
            userId
        });

        if(!task){
            return {
                status:404,
                message:"Task not found."
            };
        }

        await Task.deleteOne({_id:id});

        return {
            status:200,
            message:"Task deleted successfully.",
            data : { id }
           };

    }catch(error:any){
        return {
            status:500,
            message:error.message,
        };
    }

}
async updateTask(userId:string,id:string,updates:any)
{

    try{

        const valid = VerifyUpdateTask.safeParse({
            id,
            ...updates
        });

        if(!valid.success)
            return {
                status:400,
                message:valid.error.issues.map(i => i.message).join(", ")
        }

        const task = await Task.findOne({
            _id:id,
            userId
        });

        if(!task){
            return {
                status:404,
                message:"Task not found."
            };
        }

        Object.assign(task, updates);

        await task.save();

        return {
            status:200,
            message:"Task updated successfully",
            data:task
        };

    }catch(error:any){
        return {
            status:500,
            message:error.message
        };
    }

}
async getTasks(userId:string,pageIndex:number,){

    try{
        const tasks = await Task.find({userId})
            .skip(pageIndex*10)
            .limit(10);
        return {
            status:200,
            data:tasks,
        };

    }catch(error:any){
        return {
            status:500,
            message:error.message
        };
    }

}
async filterTasks(userId:string, pageIndex:number, status:number, priority:number)
{

    try{
        const filter:any = {
            userId
        };
        if(status !== undefined && [1,2,3].includes(status))
            filter.status = status;

        if(priority !== undefined && priority >= 1 && priority <= 3 )
            filter.priority = priority;

        const tasks = await Task.find(filter)
            .skip(pageIndex*10)
            .limit(10);


        return {
            status:200,
            data:tasks,
        };

    }catch(error:any){
        return {
            status:500,
            message:error.message
        };
    }

}
async searchTasks(userId:string, search:string,pageIndex:number,
){

    try{

       const tasks = await Task.find({userId,name: { $regex: search, $options: "i" } })
          .skip(pageIndex*10)
          .limit(10)
        return {
            status:200,
            data:tasks,
        };
    }
    catch(error:any){
        return {
            status:500,
            message:error.message
        };
    }

}
}
