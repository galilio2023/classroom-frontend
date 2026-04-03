export interface ChatSource {
  id?: number;
  title: string;
  url: string;
  type: string;
}

export interface Message {
  id?: string;
  role: "user" | "model";
  parts: { text: string }[];
  sources?: ChatSource[];
}
