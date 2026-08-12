export interface IAuthor {
  name: string;
  job_title: string;
  years_of_experience: number;
};

export default {
  name: "Adam Ettenberger",
  job_title: "Senior Software Engineer",
  years_of_experience: 12,
} satisfies IAuthor;
