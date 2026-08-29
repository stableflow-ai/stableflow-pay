export interface PayApiKey {
  id: number;
  userId: number;
  name: string;
  apiKey: string;
  createdAt: string;
  status: number;
}

export interface PayApiKeyBody {
  name: string;
}
