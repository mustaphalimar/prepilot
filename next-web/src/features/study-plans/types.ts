export type StudyPlan = {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  description: string;
  exam_date: Date;
  start_date: Date;
  progress: number;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
};

// Mock Study Plans Data
export const mockStudyPlans: StudyPlan[] = [
  {
    id: "sp-001",
    user_id: "user-123",
    title: "Advanced Calculus Final Exam Preparation",
    subject: "Mathematics",
    description:
      "Comprehensive study plan covering derivatives, integrals, series, and multivariable calculus. Includes practice problems, theorem proofs, and application exercises.",
    exam_date: new Date("2025-07-15"),
    start_date: new Date("2025-06-01"),
    progress: 65,
    end_date: new Date("2025-07-14"),
    created_at: new Date("2025-05-28"),
    updated_at: new Date("2025-06-12"),
  },
  {
    id: "sp-002",
    user_id: "user-456",
    title: "Spanish B2 Language Certification",
    subject: "Languages",
    description:
      "Intensive Spanish language preparation focusing on grammar, vocabulary expansion, listening comprehension, and conversation practice for B2 level certification.",
    exam_date: new Date("2025-08-22"),
    start_date: new Date("2025-06-10"),
    progress: 23,
    end_date: new Date("2025-08-20"),
    created_at: new Date("2025-06-08"),
    updated_at: new Date("2025-06-11"),
  },
  {
    id: "sp-003",
    user_id: "user-789",
    title: "Organic Chemistry Midterm Review",
    subject: "Chemistry",
    description:
      "Focused review of organic reaction mechanisms, nomenclature, stereochemistry, and spectroscopy. Includes flashcards, practice reactions, and lab report analysis.",
    exam_date: new Date("2025-06-28"),
    start_date: new Date("2025-06-05"),
    progress: 87,
    end_date: new Date("2025-06-27"),
    created_at: new Date("2025-06-03"),
    updated_at: new Date("2025-06-12"),
  },
];
