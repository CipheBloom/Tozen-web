import { Schema, model, Document, Types } from 'mongoose';

export enum TaskType {
  EXERCISE = 'exercise',
  DIET = 'diet',
  CUSTOM = 'custom',
}

export interface IPlanTaskBase {
  _id?: Types.ObjectId;
  title: string;
  type: TaskType;
  time?: Date;
}

export interface IPlanTask extends IPlanTaskBase {
  _id: Types.ObjectId;
}

export interface IPlanBase {
  title: string;
  duration: string;
  description: string;
  difficulty: string;
  color: string;
  icon: string;
  scheduledTasks: {
    [day: string]: IPlanTaskBase[];
  };
  userId: string;
}

export interface IPlanDocument extends IPlanBase, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlanTaskSchema = new Schema<IPlanTaskBase>({
  title: { type: String, required: true },
  type: { type: String, enum: Object.values(TaskType), required: true },
  time: { type: Date },
}, { _id: true });

const PlanSchema = new Schema<IPlanDocument>(
  {
    title: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    scheduledTasks: {
      type: Map,
      of: [PlanTaskSchema],
      required: true,
      default: {},
    },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

// Export the model
export const Plan = model<IPlanDocument>('Plan', PlanSchema);
export type IPlan = IPlanDocument;
export default Plan;
