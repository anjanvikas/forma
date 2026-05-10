import type { PlannedExercise } from '@/domain/planning/entities/PlannedExercise'
import type { SessionType } from '@/domain/planning/value-objects/SessionType'

const PUSH_1: PlannedExercise[] = [
  { id: 'p2_bench',         name: 'Barbell Bench Press',     sets: 4, reps: { min: 6, max: 8 },   isCompound: true,  muscleGroup: 'CHEST',     defaultStartingWeightKg: 55, weightStepKg: 2.5 },
  { id: 'p2_incline_db',    name: 'Incline DB Press',        sets: 3, reps: { min: 8, max: 10 },  isCompound: false, muscleGroup: 'CHEST',     defaultStartingWeightKg: 18, weightStepKg: 2 },
  { id: 'p2_ohp',           name: 'Overhead Press',          sets: 3, reps: { min: 6, max: 8 },   isCompound: true,  muscleGroup: 'SHOULDERS', defaultStartingWeightKg: 32.5, weightStepKg: 2.5 },
  { id: 'p2_lateral_raise', name: 'DB Lateral Raise',        sets: 3, reps: { min: 12, max: 15 }, isCompound: false, muscleGroup: 'SHOULDERS', defaultStartingWeightKg: 7,  weightStepKg: 1 },
  { id: 'p2_tricep_pd',     name: 'Tricep Pushdown',         sets: 3, reps: { min: 10, max: 12 }, isCompound: false, muscleGroup: 'ARMS',      defaultStartingWeightKg: 25, weightStepKg: 2.5 },
]

const PUSH_2: PlannedExercise[] = [
  { id: 'p2_incline_bench', name: 'Incline Barbell Bench',   sets: 4, reps: { min: 6, max: 8 },   isCompound: true,  muscleGroup: 'CHEST',     defaultStartingWeightKg: 45, weightStepKg: 2.5 },
  { id: 'p2_db_press_flat', name: 'Flat DB Press',           sets: 3, reps: { min: 8, max: 10 },  isCompound: false, muscleGroup: 'CHEST',     defaultStartingWeightKg: 20, weightStepKg: 2 },
  { id: 'p2_arnold_press',  name: 'Arnold Press',            sets: 3, reps: { min: 8, max: 10 },  isCompound: false, muscleGroup: 'SHOULDERS', defaultStartingWeightKg: 12, weightStepKg: 1 },
  { id: 'p2_cable_fly',     name: 'Cable Fly',               sets: 3, reps: { min: 12, max: 15 }, isCompound: false, muscleGroup: 'CHEST',     defaultStartingWeightKg: 10, weightStepKg: 2.5 },
  { id: 'p2_overhead_ext',  name: 'Overhead Tricep Ext',     sets: 3, reps: { min: 10, max: 12 }, isCompound: false, muscleGroup: 'ARMS',      defaultStartingWeightKg: 15, weightStepKg: 2.5 },
]

const PULL_1: PlannedExercise[] = [
  { id: 'p2_deadlift',      name: 'Deadlift',                sets: 3, reps: { min: 5, max: 6 },   isCompound: true,  muscleGroup: 'BACK',      defaultStartingWeightKg: 80, weightStepKg: 5 },
  { id: 'p2_pullup',        name: 'Pull-Up',                 sets: 3, reps: { min: 6, max: 10 },  isCompound: true,  muscleGroup: 'BACK',      defaultStartingWeightKg: 0,  weightStepKg: 2.5 },
  { id: 'p2_barbell_row',   name: 'Barbell Row',             sets: 3, reps: { min: 8, max: 10 },  isCompound: true,  muscleGroup: 'BACK',      defaultStartingWeightKg: 50, weightStepKg: 2.5 },
  { id: 'p2_face_pull',     name: 'Face Pull',               sets: 3, reps: { min: 12, max: 15 }, isCompound: false, muscleGroup: 'SHOULDERS', defaultStartingWeightKg: 15, weightStepKg: 2.5 },
  { id: 'p2_bb_curl',       name: 'Barbell Curl',            sets: 3, reps: { min: 8, max: 10 },  isCompound: false, muscleGroup: 'ARMS',      defaultStartingWeightKg: 20, weightStepKg: 2.5 },
]

const PULL_2: PlannedExercise[] = [
  { id: 'p2_rdl',           name: 'Romanian Deadlift',       sets: 3, reps: { min: 8, max: 10 },  isCompound: true,  muscleGroup: 'BACK',      defaultStartingWeightKg: 60, weightStepKg: 2.5 },
  { id: 'p2_lat_pulldown',  name: 'Lat Pulldown',            sets: 3, reps: { min: 10, max: 12 }, isCompound: false, muscleGroup: 'BACK',      defaultStartingWeightKg: 45, weightStepKg: 2.5 },
  { id: 'p2_seated_row',    name: 'Seated Cable Row',        sets: 3, reps: { min: 8, max: 10 },  isCompound: false, muscleGroup: 'BACK',      defaultStartingWeightKg: 45, weightStepKg: 2.5 },
  { id: 'p2_rear_delt',     name: 'Reverse Pec Deck',        sets: 3, reps: { min: 12, max: 15 }, isCompound: false, muscleGroup: 'SHOULDERS', defaultStartingWeightKg: 20, weightStepKg: 2.5 },
  { id: 'p2_db_hammer',     name: 'DB Hammer Curl',          sets: 3, reps: { min: 10, max: 12 }, isCompound: false, muscleGroup: 'ARMS',      defaultStartingWeightKg: 10, weightStepKg: 1 },
]

const LEGS_1: PlannedExercise[] = [
  { id: 'p2_squat',         name: 'Barbell Back Squat',      sets: 4, reps: { min: 6, max: 8 },   isCompound: true,  muscleGroup: 'LEGS', defaultStartingWeightKg: 65, weightStepKg: 2.5 },
  { id: 'p2_leg_press',     name: 'Leg Press',               sets: 3, reps: { min: 10, max: 12 }, isCompound: false, muscleGroup: 'LEGS', defaultStartingWeightKg: 100, weightStepKg: 5 },
  { id: 'p2_leg_curl',      name: 'Leg Curl',                sets: 3, reps: { min: 10, max: 12 }, isCompound: false, muscleGroup: 'LEGS', defaultStartingWeightKg: 30, weightStepKg: 2.5 },
  { id: 'p2_calf_raise',    name: 'Standing Calf Raise',     sets: 4, reps: { min: 12, max: 15 }, isCompound: false, muscleGroup: 'LEGS', defaultStartingWeightKg: 40, weightStepKg: 2.5 },
  { id: 'p2_plank',         name: 'Plank',                   sets: 3, reps: { min: 45, max: 60 }, isCompound: false, muscleGroup: 'CORE', defaultStartingWeightKg: 0, weightStepKg: 0 },
]

const LEGS_2: PlannedExercise[] = [
  { id: 'p2_front_squat',   name: 'Front Squat',             sets: 3, reps: { min: 6, max: 8 },   isCompound: true,  muscleGroup: 'LEGS', defaultStartingWeightKg: 50, weightStepKg: 2.5 },
  { id: 'p2_lunge',         name: 'Walking DB Lunge',        sets: 3, reps: { min: 10, max: 12 }, isCompound: false, muscleGroup: 'LEGS', defaultStartingWeightKg: 12, weightStepKg: 2 },
  { id: 'p2_leg_ext',       name: 'Leg Extension',           sets: 3, reps: { min: 12, max: 15 }, isCompound: false, muscleGroup: 'LEGS', defaultStartingWeightKg: 30, weightStepKg: 2.5 },
  { id: 'p2_seated_calf',   name: 'Seated Calf Raise',       sets: 4, reps: { min: 15, max: 20 }, isCompound: false, muscleGroup: 'LEGS', defaultStartingWeightKg: 25, weightStepKg: 2.5 },
  { id: 'p2_hanging_leg',   name: 'Hanging Leg Raise',       sets: 3, reps: { min: 8, max: 12 },  isCompound: false, muscleGroup: 'CORE', defaultStartingWeightKg: 0, weightStepKg: 0 },
]

export const PHASE_2_BY_SESSION: Partial<Record<SessionType, PlannedExercise[]>> = {
  PUSH_1, PUSH_2, PULL_1, PULL_2, LEGS_1, LEGS_2,
}
