export interface GeneratedVideo {
  id: string;
  title: string;
  url: string;
  durationSeconds: number;
  generatedAt: string | null;
  status: "not_generated" | "completed" | "failed";
}

export const generatedVideos: GeneratedVideo[] = [];
