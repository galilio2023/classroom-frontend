// This file defines the shape of data used throughout the application.
// These types should ideally match the responses from your backend API.

// --- Generic API Response Types ---

export type ListResponse<T = unknown> = {
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateResponse<T = unknown> = {
  data?: T;
};

export type GetOneResponse<T = unknown> = {
  data?: T;
};


// --- Core Data Models ---

export type Department = {
  id: number;
  name: string;
  code: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Subject = {
  id: number;
  name: string;
  code: string;
  description: string;
  department: Department; // Correctly typed as a nested object
  createdAt?: string;
  updatedAt?: string;
};

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
  imageCldPubId?: string;
  department?: Department; // Assuming the backend can return a nested department
};

export type Schedule = {
  day: string;
  startTime: string;
  endTime: string;
};

export enum ClassStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

export type Class = {
  id: number;
  name: string;
  description: string;
  status: ClassStatus;
  capacity: number;
  inviteCode: string;
  bannerUrl?: string;
  bannerCldPubId?: string;
  subject: Subject;
  teacher: User;
  schedules: Schedule[];
  createdAt: string;
  updatedAt: string;
};


// --- API Payloads ---

export type SignUpPayload = {
  email: string;
  name: string;
  password: string;
  image?: string;
  imageCldPubId?: string;
  role: UserRole;
};


// --- Cloudinary & Widget Types (for file uploads) ---

declare global {
  interface CloudinaryUploadWidgetResults {
    event: string;
    info: {
      secure_url: string;
      public_id: string;
      delete_token?: string;
      resource_type: string;
      original_filename: string;
    };
  }

  interface CloudinaryWidget {
    open: () => void;
  }

  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (
          error: unknown,
          result: CloudinaryUploadWidgetResults,
        ) => void,
      ) => CloudinaryWidget;
    };
  }
}

export interface UploadWidgetValue {
  url: string;
  publicId: string;
}

export interface UploadWidgetProps {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue | null) => void;
  disabled?: boolean;
}
