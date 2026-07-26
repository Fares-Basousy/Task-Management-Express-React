import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  id: { type: String},
  name: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: String, required: true, ref : "User" },
  status: { type: Number, default : 1 },
  priority : {type : Number, default : 2},
  dueDate : {type : Number, default : () => (Date.now() + 24*60*60*1000)} //next day default value
});

const Task = mongoose.model("Task", TaskSchema);
export default Task
