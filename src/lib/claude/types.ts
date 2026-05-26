export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorContext {
  language: "fr" | "ar" | "darija";
  chapterTitle?: string;
  chapterContent?: string;
  studentFirstName?: string;
  studentFiliere?: string;
}

export interface TutorResponse {
  content: string;
  tokensUsed: number;
  isMock: boolean;
}
