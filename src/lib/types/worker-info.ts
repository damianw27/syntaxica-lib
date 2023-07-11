export interface WorkerVersionDetails {
  readonly name: string;
  readonly url: string;
}

export interface WorkerInfo {
  readonly name: string;
  readonly versions: WorkerVersionDetails[];
}
